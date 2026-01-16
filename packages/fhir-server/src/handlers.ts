/**
 * FHIR Resource Handlers
 * Business logic for creating, validating, and managing FHIR resources
 */

import type {
  Patient,
  Practitioner,
  Organization,
  Medication,
  MedicationRequest,
  MedicationDispense,
  Bundle,
  BundleEntry,
  Identifier,
  Reference,
  FHIRID,
} from '@e-rezept/fhir-types';
import { GermanCodeSystems } from '@e-rezept/fhir-types';
import { fhirStore, type ResourceStore } from './store.js';

// =============================================================================
// Patient Handler
// =============================================================================

export class PatientHandler {
  private store: ResourceStore<Patient>;

  constructor() {
    this.store = fhirStore.getStore<Patient>('Patient');
  }

  async create(patient: Omit<Patient, 'resourceType'>): Promise<Patient> {
    const resource: Patient = {
      ...patient,
      resourceType: 'Patient',
    };
    return this.store.create(resource);
  }

  async read(id: FHIRID): Promise<Patient | null> {
    return this.store.read(id);
  }

  async update(id: FHIRID, patient: Omit<Patient, 'resourceType'>): Promise<Patient | null> {
    const resource: Patient = {
      ...patient,
      resourceType: 'Patient',
    };
    return this.store.update(id, resource);
  }

  async delete(id: FHIRID): Promise<boolean> {
    return this.store.delete(id);
  }

  async search(params: Record<string, string>): Promise<Patient[]> {
    return this.store.search(params);
  }

  async findByKVNR(kvnr: string): Promise<Patient | null> {
    const patients = await this.store.list();
    return patients.find(p => 
      p.identifier?.some(id => 
        id.system === GermanCodeSystems.KVNR && id.value === kvnr
      )
    ) || null;
  }
}

// =============================================================================
// Practitioner Handler
// =============================================================================

export class PractitionerHandler {
  private store: ResourceStore<Practitioner>;

  constructor() {
    this.store = fhirStore.getStore<Practitioner>('Practitioner');
  }

  async create(practitioner: Omit<Practitioner, 'resourceType'>): Promise<Practitioner> {
    const resource: Practitioner = {
      ...practitioner,
      resourceType: 'Practitioner',
    };
    return this.store.create(resource);
  }

  async read(id: FHIRID): Promise<Practitioner | null> {
    return this.store.read(id);
  }

  async update(id: FHIRID, practitioner: Omit<Practitioner, 'resourceType'>): Promise<Practitioner | null> {
    const resource: Practitioner = {
      ...practitioner,
      resourceType: 'Practitioner',
    };
    return this.store.update(id, resource);
  }

  async delete(id: FHIRID): Promise<boolean> {
    return this.store.delete(id);
  }

  async search(params: Record<string, string>): Promise<Practitioner[]> {
    return this.store.search(params);
  }

  async findByLANR(lanr: string): Promise<Practitioner | null> {
    const practitioners = await this.store.list();
    return practitioners.find(p => 
      p.identifier?.some(id => 
        id.system === GermanCodeSystems.LANR && id.value === lanr
      )
    ) || null;
  }
}

// =============================================================================
// MedicationRequest Handler (E-Rezept Prescription)
// =============================================================================

export class MedicationRequestHandler {
  private store: ResourceStore<MedicationRequest>;

  constructor() {
    this.store = fhirStore.getStore<MedicationRequest>('MedicationRequest');
  }

  async create(prescription: Omit<MedicationRequest, 'resourceType'>): Promise<MedicationRequest> {
    const resource: MedicationRequest = {
      ...prescription,
      resourceType: 'MedicationRequest',
      status: prescription.status || 'active',
      intent: prescription.intent || 'order',
      authoredOn: prescription.authoredOn || new Date().toISOString().split('T')[0],
    };
    return this.store.create(resource);
  }

  async read(id: FHIRID): Promise<MedicationRequest | null> {
    return this.store.read(id);
  }

  async update(id: FHIRID, prescription: Omit<MedicationRequest, 'resourceType'>): Promise<MedicationRequest | null> {
    const resource: MedicationRequest = {
      ...prescription,
      resourceType: 'MedicationRequest',
    };
    return this.store.update(id, resource);
  }

  async delete(id: FHIRID): Promise<boolean> {
    return this.store.delete(id);
  }

  async search(params: Record<string, string>): Promise<MedicationRequest[]> {
    return this.store.search(params);
  }

  async findByPatient(patientId: string): Promise<MedicationRequest[]> {
    return this.search({ patient: patientId });
  }

  async findByPrescriber(practitionerId: string): Promise<MedicationRequest[]> {
    return this.search({ requester: practitionerId });
  }
}

// =============================================================================
// Bundle Handler
// =============================================================================

export class BundleHandler {
  private store: ResourceStore<Bundle>;

  constructor() {
    this.store = fhirStore.getStore<Bundle>('Bundle');
  }

  async create(bundle: Omit<Bundle, 'resourceType'>): Promise<Bundle> {
    const resource: Bundle = {
      ...bundle,
      resourceType: 'Bundle',
      timestamp: bundle.timestamp || new Date().toISOString(),
    };
    return this.store.create(resource);
  }

  async read(id: FHIRID): Promise<Bundle | null> {
    return this.store.read(id);
  }

  async delete(id: FHIRID): Promise<boolean> {
    return this.store.delete(id);
  }

  /**
   * Create an E-Rezept document bundle containing MedicationRequest and related resources
   */
  async createPrescriptionBundle(params: {
    prescriptionId: string;
    medicationRequest: MedicationRequest;
    patient: Patient;
    practitioner: Practitioner;
  }): Promise<Bundle> {
    const { prescriptionId, medicationRequest, patient, practitioner } = params;

    const entries: BundleEntry[] = [
      {
        fullUrl: `urn:uuid:${medicationRequest.id || 'medication-request'}`,
        resource: medicationRequest,
      },
      {
        fullUrl: `urn:uuid:${patient.id || 'patient'}`,
        resource: patient,
      },
      {
        fullUrl: `urn:uuid:${practitioner.id || 'practitioner'}`,
        resource: practitioner,
      },
    ];

    const bundle: Omit<Bundle, 'resourceType'> = {
      type: 'document',
      identifier: {
        system: GermanCodeSystems.PRESCRIPTION_ID,
        value: prescriptionId,
      },
      timestamp: new Date().toISOString(),
      entry: entries,
    };

    return this.create(bundle);
  }

  /**
   * Generate a new prescription ID in E-Rezept format
   * Format: 160.xxx.xxx.xxx.xxx.xx
   */
  generatePrescriptionId(): string {
    const random = () => Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const checksum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `160.${random()}.${random()}.${random()}.${random()}.${checksum}`;
  }
}

// =============================================================================
// Handler Instances
// =============================================================================

export const patientHandler = new PatientHandler();
export const practitionerHandler = new PractitionerHandler();
export const medicationRequestHandler = new MedicationRequestHandler();
export const bundleHandler = new BundleHandler();
