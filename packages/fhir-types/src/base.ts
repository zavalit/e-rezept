/**
 * FHIR R4 Base Types
 * Based on HL7 FHIR R4 specification
 * Simplified for E-Rezept demo purposes
 */

// =============================================================================
// FHIR Primitive Types
// =============================================================================

/** FHIR instant - precise date/time with timezone */
export type FHIRInstant = string;

/** FHIR dateTime - date and optionally time */
export type FHIRDateTime = string;

/** FHIR date - date only (YYYY-MM-DD) */
export type FHIRDate = string;

/** FHIR uri - uniform resource identifier */
export type FHIRURI = string;

/** FHIR code - coded value from a defined set */
export type FHIRCode = string;

/** FHIR id - resource identifier */
export type FHIRID = string;

/** FHIR base64Binary - base64 encoded binary data */
export type FHIRBase64Binary = string;

// =============================================================================
// FHIR Complex Types
// =============================================================================

/** FHIR Coding - reference to a code defined by a terminology system */
export interface Coding {
  system?: FHIRURI;
  version?: string;
  code?: FHIRCode;
  display?: string;
  userSelected?: boolean;
}

/** FHIR CodeableConcept - concept with coding(s) and text */
export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

/** FHIR Identifier - identifier for a resource */
export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: CodeableConcept;
  system?: FHIRURI;
  value?: string;
  period?: Period;
  assigner?: Reference;
}

/** FHIR Period - time range defined by start and end */
export interface Period {
  start?: FHIRDateTime;
  end?: FHIRDateTime;
}

/** FHIR Reference - reference to another resource */
export interface Reference {
  reference?: string;
  type?: FHIRURI;
  identifier?: Identifier;
  display?: string;
}

/** FHIR HumanName - name of a human */
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

/** FHIR Address - postal address */
export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

/** FHIR ContactPoint - contact information */
export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

/** FHIR Quantity - measured amount */
export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: FHIRURI;
  code?: FHIRCode;
}

/** FHIR Signature - digital signature */
export interface Signature {
  type: Coding[];
  when: FHIRInstant;
  who: Reference;
  onBehalfOf?: Reference;
  targetFormat?: FHIRCode;
  sigFormat?: FHIRCode;
  data?: FHIRBase64Binary;
}

/** FHIR Meta - metadata about a resource */
export interface Meta {
  versionId?: FHIRID;
  lastUpdated?: FHIRInstant;
  source?: FHIRURI;
  profile?: FHIRURI[];
  security?: Coding[];
  tag?: Coding[];
}

/** FHIR Extension - additional information */
export interface Extension {
  url: FHIRURI;
  valueString?: string;
  valueBoolean?: boolean;
  valueCode?: FHIRCode;
  valueCoding?: Coding;
  valueReference?: Reference;
  valueQuantity?: Quantity;
  // Add more value types as needed
}

// =============================================================================
// FHIR Resource Base
// =============================================================================

/** Base interface for all FHIR resources */
export interface Resource {
  resourceType: string;
  id?: FHIRID;
  meta?: Meta;
  implicitRules?: FHIRURI;
  language?: FHIRCode;
}

/** Base interface for domain resources */
export interface DomainResource extends Resource {
  text?: Narrative;
  contained?: Resource[];
  extension?: Extension[];
  modifierExtension?: Extension[];
}

/** FHIR Narrative - text summary of resource */
export interface Narrative {
  status: 'generated' | 'extensions' | 'additional' | 'empty';
  div: string;
}
