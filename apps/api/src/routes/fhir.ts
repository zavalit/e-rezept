/**
 * FHIR REST API Routes
 * Implementation of FHIR RESTful API for E-Rezept resources
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Patient, Practitioner, MedicationRequest, Bundle, FHIRID } from '@e-rezept/fhir-types';
import {
  patientHandler,
  practitionerHandler,
  medicationRequestHandler,
  bundleHandler,
} from '@e-rezept/fhir-server';

// =============================================================================
// Type Definitions
// =============================================================================

interface IdParams {
  id: FHIRID;
}

interface SearchQuery {
  patient?: string;
  subject?: string;
  requester?: string;
  _id?: string;
}

// =============================================================================
// Patient Routes
// =============================================================================

async function registerPatientRoutes(fastify: FastifyInstance): Promise<void> {
  // Create Patient
  fastify.post<{ Body: Omit<Patient, 'resourceType'> }>(
    '/fhir/Patient',
    async (request, reply) => {
      const patient = await patientHandler.create(request.body);
      reply.code(201).header('Location', `/fhir/Patient/${patient.id}`);
      return patient;
    }
  );

  // Read Patient
  fastify.get<{ Params: IdParams }>(
    '/fhir/Patient/:id',
    async (request, reply) => {
      const patient = await patientHandler.read(request.params.id);
      if (!patient) {
        reply.code(404);
        return {
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `Patient/${request.params.id} not found`,
          }],
        };
      }
      return patient;
    }
  );

  // Update Patient
  fastify.put<{ Params: IdParams; Body: Omit<Patient, 'resourceType'> }>(
    '/fhir/Patient/:id',
    async (request, reply) => {
      const patient = await patientHandler.update(request.params.id, request.body);
      if (!patient) {
        reply.code(404);
        return {
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `Patient/${request.params.id} not found`,
          }],
        };
      }
      return patient;
    }
  );

  // Delete Patient
  fastify.delete<{ Params: IdParams }>(
    '/fhir/Patient/:id',
    async (request, reply) => {
      const deleted = await patientHandler.delete(request.params.id);
      if (!deleted) {
        reply.code(404);
        return {
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `Patient/${request.params.id} not found`,
          }],
        };
      }
      reply.code(204);
      return;
    }
  );

  // Search Patients
  fastify.get<{ Querystring: SearchQuery }>(
    '/fhir/Patient',
    async (request) => {
      const patients = await patientHandler.search(request.query as Record<string, string>);
      return {
        resourceType: 'Bundle',
        type: 'searchset',
        total: patients.length,
        entry: patients.map(patient => ({
          fullUrl: `/fhir/Patient/${patient.id}`,
          resource: patient,
        })),
      };
    }
  );
}

// =============================================================================
// Practitioner Routes
// =============================================================================

async function registerPractitionerRoutes(fastify: FastifyInstance): Promise<void> {
  // Create Practitioner
  fastify.post<{ Body: Omit<Practitioner, 'resourceType'> }>(
    '/fhir/Practitioner',
    async (request, reply) => {
      const practitioner = await practitionerHandler.create(request.body);
      reply.code(201).header('Location', `/fhir/Practitioner/${practitioner.id}`);
      return practitioner;
    }
  );

  // Read Practitioner
  fastify.get<{ Params: IdParams }>(
    '/fhir/Practitioner/:id',
    async (request, reply) => {
      const practitioner = await practitionerHandler.read(request.params.id);
      if (!practitioner) {
        reply.code(404);
        return {
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `Practitioner/${request.params.id} not found`,
          }],
        };
      }
      return practitioner;
    }
  );

  // Search Practitioners
  fastify.get<{ Querystring: SearchQuery }>(
    '/fhir/Practitioner',
    async (request) => {
      const practitioners = await practitionerHandler.search(request.query as Record<string, string>);
      return {
        resourceType: 'Bundle',
        type: 'searchset',
        total: practitioners.length,
        entry: practitioners.map(practitioner => ({
          fullUrl: `/fhir/Practitioner/${practitioner.id}`,
          resource: practitioner,
        })),
      };
    }
  );
}

// =============================================================================
// MedicationRequest Routes (Prescriptions)
// =============================================================================

async function registerMedicationRequestRoutes(fastify: FastifyInstance): Promise<void> {
  // Create MedicationRequest (Prescription)
  fastify.post<{ Body: Omit<MedicationRequest, 'resourceType'> }>(
    '/fhir/MedicationRequest',
    async (request, reply) => {
      const prescription = await medicationRequestHandler.create(request.body);
      reply.code(201).header('Location', `/fhir/MedicationRequest/${prescription.id}`);
      return prescription;
    }
  );

  // Read MedicationRequest
  fastify.get<{ Params: IdParams }>(
    '/fhir/MedicationRequest/:id',
    async (request, reply) => {
      const prescription = await medicationRequestHandler.read(request.params.id);
      if (!prescription) {
        reply.code(404);
        return {
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `MedicationRequest/${request.params.id} not found`,
          }],
        };
      }
      return prescription;
    }
  );

  // Update MedicationRequest
  fastify.put<{ Params: IdParams; Body: Omit<MedicationRequest, 'resourceType'> }>(
    '/fhir/MedicationRequest/:id',
    async (request, reply) => {
      const prescription = await medicationRequestHandler.update(request.params.id, request.body);
      if (!prescription) {
        reply.code(404);
        return {
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `MedicationRequest/${request.params.id} not found`,
          }],
        };
      }
      return prescription;
    }
  );

  // Search MedicationRequests
  fastify.get<{ Querystring: SearchQuery }>(
    '/fhir/MedicationRequest',
    async (request) => {
      const prescriptions = await medicationRequestHandler.search(request.query as Record<string, string>);
      return {
        resourceType: 'Bundle',
        type: 'searchset',
        total: prescriptions.length,
        entry: prescriptions.map(prescription => ({
          fullUrl: `/fhir/MedicationRequest/${prescription.id}`,
          resource: prescription,
        })),
      };
    }
  );
}

// =============================================================================
// Bundle Routes
// =============================================================================

async function registerBundleRoutes(fastify: FastifyInstance): Promise<void> {
  // Create Bundle
  fastify.post<{ Body: Omit<Bundle, 'resourceType'> }>(
    '/fhir/Bundle',
    async (request, reply) => {
      const bundle = await bundleHandler.create(request.body);
      reply.code(201).header('Location', `/fhir/Bundle/${bundle.id}`);
      return bundle;
    }
  );

  // Read Bundle
  fastify.get<{ Params: IdParams }>(
    '/fhir/Bundle/:id',
    async (request, reply) => {
      const bundle = await bundleHandler.read(request.params.id);
      if (!bundle) {
        reply.code(404);
        return {
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `Bundle/${request.params.id} not found`,
          }],
        };
      }
      return bundle;
    }
  );

  // Generate new prescription ID
  fastify.post(
    '/fhir/$generate-prescription-id',
    async () => {
      return {
        prescriptionId: bundleHandler.generatePrescriptionId(),
      };
    }
  );
}

// =============================================================================
// Metadata/Capability Statement
// =============================================================================

async function registerMetadataRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/fhir/metadata', async () => {
    return {
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: new Date().toISOString(),
      kind: 'instance',
      software: {
        name: 'E-Rezept Demo FHIR Server',
        version: '0.1.0',
      },
      fhirVersion: '4.0.1',
      format: ['json'],
      rest: [{
        mode: 'server',
        resource: [
          {
            type: 'Patient',
            interaction: [
              { code: 'read' },
              { code: 'create' },
              { code: 'update' },
              { code: 'delete' },
              { code: 'search-type' },
            ],
          },
          {
            type: 'Practitioner',
            interaction: [
              { code: 'read' },
              { code: 'create' },
              { code: 'search-type' },
            ],
          },
          {
            type: 'MedicationRequest',
            interaction: [
              { code: 'read' },
              { code: 'create' },
              { code: 'update' },
              { code: 'search-type' },
            ],
          },
          {
            type: 'Bundle',
            interaction: [
              { code: 'read' },
              { code: 'create' },
            ],
          },
        ],
      }],
    };
  });
}

// =============================================================================
// Register All Routes
// =============================================================================

export async function registerFHIRRoutes(fastify: FastifyInstance): Promise<void> {
  await registerMetadataRoutes(fastify);
  await registerPatientRoutes(fastify);
  await registerPractitionerRoutes(fastify);
  await registerMedicationRequestRoutes(fastify);
  await registerBundleRoutes(fastify);

  fastify.log.info('FHIR routes registered');
}
