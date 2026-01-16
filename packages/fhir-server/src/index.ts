/**
 * @e-rezept/fhir-server
 * FHIR R4 server implementation for E-Rezept demo
 */

// Store
export { fhirStore, FHIRStoreManager, InMemoryStore, type ResourceStore } from './store.js';

// Handlers
export {
  patientHandler,
  practitionerHandler,
  medicationRequestHandler,
  bundleHandler,
  PatientHandler,
  PractitionerHandler,
  MedicationRequestHandler,
  BundleHandler,
} from './handlers.js';
