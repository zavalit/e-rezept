/**
 * FHIR R4 Resource Types
 * Patient, Practitioner, Organization, Medication, MedicationRequest
 */

import type {
  DomainResource,
  HumanName,
  Identifier,
  Address,
  ContactPoint,
  CodeableConcept,
  Reference,
  Period,
  Quantity,
  FHIRDate,
  FHIRDateTime,
  FHIRCode,
  Extension,
} from './base.js';

// =============================================================================
// Patient Resource
// =============================================================================

/** FHIR Patient - demographics and administrative information */
export interface Patient extends DomainResource {
  resourceType: 'Patient';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: FHIRDate;
  deceasedBoolean?: boolean;
  deceasedDateTime?: FHIRDateTime;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  contact?: PatientContact[];
  communication?: PatientCommunication[];
  generalPractitioner?: Reference[];
  managingOrganization?: Reference;
}

export interface PatientContact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: Reference;
  period?: Period;
}

export interface PatientCommunication {
  language: CodeableConcept;
  preferred?: boolean;
}

// =============================================================================
// Practitioner Resource
// =============================================================================

/** FHIR Practitioner - healthcare professional */
export interface Practitioner extends DomainResource {
  resourceType: 'Practitioner';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  address?: Address[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: FHIRDate;
  photo?: Attachment[];
  qualification?: PractitionerQualification[];
  communication?: CodeableConcept[];
}

export interface PractitionerQualification {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference;
}

export interface Attachment {
  contentType?: FHIRCode;
  language?: FHIRCode;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: FHIRDateTime;
}

// =============================================================================
// Organization Resource
// =============================================================================

/** FHIR Organization - formally or informally recognized grouping */
export interface Organization extends DomainResource {
  resourceType: 'Organization';
  identifier?: Identifier[];
  active?: boolean;
  type?: CodeableConcept[];
  name?: string;
  alias?: string[];
  telecom?: ContactPoint[];
  address?: Address[];
  partOf?: Reference;
  contact?: OrganizationContact[];
}

export interface OrganizationContact {
  purpose?: CodeableConcept;
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
}

// =============================================================================
// Medication Resource
// =============================================================================

/** FHIR Medication - definition of a medication */
export interface Medication extends DomainResource {
  resourceType: 'Medication';
  identifier?: Identifier[];
  code?: CodeableConcept;
  status?: 'active' | 'inactive' | 'entered-in-error';
  manufacturer?: Reference;
  form?: CodeableConcept;
  amount?: Ratio;
  ingredient?: MedicationIngredient[];
  batch?: MedicationBatch;
}

export interface Ratio {
  numerator?: Quantity;
  denominator?: Quantity;
}

export interface MedicationIngredient {
  itemCodeableConcept?: CodeableConcept;
  itemReference?: Reference;
  isActive?: boolean;
  strength?: Ratio;
}

export interface MedicationBatch {
  lotNumber?: string;
  expirationDate?: FHIRDateTime;
}

// =============================================================================
// MedicationRequest Resource (E-Rezept Prescription)
// =============================================================================

/** FHIR MedicationRequest - ordering of medication */
export interface MedicationRequest extends DomainResource {
  resourceType: 'MedicationRequest';
  identifier?: Identifier[];
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  statusReason?: CodeableConcept;
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: CodeableConcept[];
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  doNotPerform?: boolean;
  reportedBoolean?: boolean;
  reportedReference?: Reference;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  subject: Reference;
  encounter?: Reference;
  supportingInformation?: Reference[];
  authoredOn?: FHIRDateTime;
  requester?: Reference;
  performer?: Reference;
  performerType?: CodeableConcept;
  recorder?: Reference;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  basedOn?: Reference[];
  groupIdentifier?: Identifier;
  courseOfTherapyType?: CodeableConcept;
  insurance?: Reference[];
  note?: Annotation[];
  dosageInstruction?: Dosage[];
  dispenseRequest?: MedicationRequestDispenseRequest;
  substitution?: MedicationRequestSubstitution;
  priorPrescription?: Reference;
  detectedIssue?: Reference[];
  eventHistory?: Reference[];
}

export interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  time?: FHIRDateTime;
  text: string;
}

export interface Dosage {
  sequence?: number;
  text?: string;
  additionalInstruction?: CodeableConcept[];
  patientInstruction?: string;
  timing?: Timing;
  asNeededBoolean?: boolean;
  asNeededCodeableConcept?: CodeableConcept;
  site?: CodeableConcept;
  route?: CodeableConcept;
  method?: CodeableConcept;
  doseAndRate?: DosageDoseAndRate[];
  maxDosePerPeriod?: Ratio;
  maxDosePerAdministration?: Quantity;
  maxDosePerLifetime?: Quantity;
  extension?: Extension[];
}

export interface Timing {
  event?: FHIRDateTime[];
  repeat?: TimingRepeat;
  code?: CodeableConcept;
}

export interface TimingRepeat {
  boundsDuration?: Duration;
  boundsPeriod?: Period;
  count?: number;
  countMax?: number;
  duration?: number;
  durationMax?: number;
  durationUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  frequency?: number;
  frequencyMax?: number;
  period?: number;
  periodMax?: number;
  periodUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  dayOfWeek?: FHIRCode[];
  timeOfDay?: string[];
  when?: FHIRCode[];
  offset?: number;
}

export interface Duration extends Quantity {
  // Duration is a specialized Quantity
}

export interface DosageDoseAndRate {
  type?: CodeableConcept;
  doseRange?: Range;
  doseQuantity?: Quantity;
  rateRatio?: Ratio;
  rateRange?: Range;
  rateQuantity?: Quantity;
}

export interface Range {
  low?: Quantity;
  high?: Quantity;
}

export interface MedicationRequestDispenseRequest {
  initialFill?: MedicationRequestInitialFill;
  dispenseInterval?: Duration;
  validityPeriod?: Period;
  numberOfRepeatsAllowed?: number;
  quantity?: Quantity;
  expectedSupplyDuration?: Duration;
  performer?: Reference;
}

export interface MedicationRequestInitialFill {
  quantity?: Quantity;
  duration?: Duration;
}

export interface MedicationRequestSubstitution {
  allowedBoolean?: boolean;
  allowedCodeableConcept?: CodeableConcept;
  reason?: CodeableConcept;
}

// =============================================================================
// MedicationDispense Resource (Pharmacy Dispensation)
// =============================================================================

/** FHIR MedicationDispense - dispensing of medication */
export interface MedicationDispense extends DomainResource {
  resourceType: 'MedicationDispense';
  identifier?: Identifier[];
  partOf?: Reference[];
  status: 'preparation' | 'in-progress' | 'cancelled' | 'on-hold' | 'completed' | 'entered-in-error' | 'stopped' | 'declined' | 'unknown';
  statusReasonCodeableConcept?: CodeableConcept;
  statusReasonReference?: Reference;
  category?: CodeableConcept;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  subject?: Reference;
  context?: Reference;
  supportingInformation?: Reference[];
  performer?: MedicationDispensePerformer[];
  location?: Reference;
  authorizingPrescription?: Reference[];
  type?: CodeableConcept;
  quantity?: Quantity;
  daysSupply?: Quantity;
  whenPrepared?: FHIRDateTime;
  whenHandedOver?: FHIRDateTime;
  destination?: Reference;
  receiver?: Reference[];
  note?: Annotation[];
  dosageInstruction?: Dosage[];
  substitution?: MedicationDispenseSubstitution;
  detectedIssue?: Reference[];
  eventHistory?: Reference[];
}

export interface MedicationDispensePerformer {
  function?: CodeableConcept;
  actor: Reference;
}

export interface MedicationDispenseSubstitution {
  wasSubstituted: boolean;
  type?: CodeableConcept;
  reason?: CodeableConcept[];
  responsibleParty?: Reference[];
}
