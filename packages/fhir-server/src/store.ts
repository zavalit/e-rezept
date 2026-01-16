/**
 * In-memory FHIR resource store
 * For demo purposes - can be replaced with PostgreSQL later
 */

import type { Resource, FHIRID } from '@e-rezept/fhir-types';

export interface ResourceStore<T extends Resource> {
  create(resource: T): Promise<T>;
  read(id: FHIRID): Promise<T | null>;
  update(id: FHIRID, resource: T): Promise<T | null>;
  delete(id: FHIRID): Promise<boolean>;
  search(params: Record<string, string>): Promise<T[]>;
  list(): Promise<T[]>;
}

/**
 * In-memory implementation of ResourceStore
 */
export class InMemoryStore<T extends Resource> implements ResourceStore<T> {
  private resources: Map<string, T> = new Map();
  private idCounter = 0;

  async create(resource: T): Promise<T> {
    const id = resource.id || this.generateId();
    const stored: T = {
      ...resource,
      id,
      meta: {
        ...resource.meta,
        versionId: '1',
        lastUpdated: new Date().toISOString(),
      },
    };
    this.resources.set(id, stored);
    return stored;
  }

  async read(id: FHIRID): Promise<T | null> {
    return this.resources.get(id) || null;
  }

  async update(id: FHIRID, resource: T): Promise<T | null> {
    const existing = this.resources.get(id);
    if (!existing) {
      return null;
    }

    const currentVersion = parseInt(existing.meta?.versionId || '1', 10);
    const updated: T = {
      ...resource,
      id,
      meta: {
        ...resource.meta,
        versionId: String(currentVersion + 1),
        lastUpdated: new Date().toISOString(),
      },
    };
    this.resources.set(id, updated);
    return updated;
  }

  async delete(id: FHIRID): Promise<boolean> {
    return this.resources.delete(id);
  }

  async search(params: Record<string, string>): Promise<T[]> {
    const results: T[] = [];
    
    for (const resource of this.resources.values()) {
      if (this.matchesSearch(resource, params)) {
        results.push(resource);
      }
    }
    
    return results;
  }

  async list(): Promise<T[]> {
    return Array.from(this.resources.values());
  }

  private generateId(): string {
    this.idCounter++;
    return `${Date.now()}-${this.idCounter}`;
  }

  private matchesSearch(resource: T, params: Record<string, string>): boolean {
    // Simple search implementation - matches common FHIR search parameters
    for (const [key, value] of Object.entries(params)) {
      if (key === '_id' && resource.id !== value) {
        return false;
      }
      
      // Handle reference searches (e.g., subject=Patient/123)
      if (key === 'subject' || key === 'patient') {
        const subjectRef = (resource as Record<string, unknown>).subject as { reference?: string } | undefined;
        if (!subjectRef?.reference?.includes(value)) {
          return false;
        }
      }
      
      // Handle requester searches (e.g., requester=Practitioner/456)
      if (key === 'requester') {
        const requesterRef = (resource as Record<string, unknown>).requester as { reference?: string } | undefined;
        if (!requesterRef?.reference?.includes(value)) {
          return false;
        }
      }
    }
    
    return true;
  }
}

/**
 * Central store manager for all resource types
 */
export class FHIRStoreManager {
  private stores: Map<string, InMemoryStore<Resource>> = new Map();

  getStore<T extends Resource>(resourceType: string): ResourceStore<T> {
    let store = this.stores.get(resourceType);
    if (!store) {
      store = new InMemoryStore<Resource>();
      this.stores.set(resourceType, store);
    }
    return store as unknown as ResourceStore<T>;
  }

  async getResource<T extends Resource>(resourceType: string, id: FHIRID): Promise<T | null> {
    const store = this.getStore<T>(resourceType);
    return store.read(id);
  }

  async saveResource<T extends Resource>(resource: T): Promise<T> {
    const store = this.getStore<T>(resource.resourceType);
    if (resource.id) {
      const existing = await store.read(resource.id);
      if (existing) {
        return (await store.update(resource.id, resource)) as T;
      }
    }
    return store.create(resource);
  }

  async deleteResource(resourceType: string, id: FHIRID): Promise<boolean> {
    const store = this.getStore(resourceType);
    return store.delete(id);
  }

  async searchResources<T extends Resource>(
    resourceType: string,
    params: Record<string, string>
  ): Promise<T[]> {
    const store = this.getStore<T>(resourceType);
    return store.search(params);
  }
}

// Singleton instance
export const fhirStore = new FHIRStoreManager();
