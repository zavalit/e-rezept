/**
 * FHIR Bundle Resource
 * Container for a collection of resources
 */

import type {
  Resource,
  Meta,
  Identifier,
  Signature,
  FHIRURI,
  FHIRInstant,
  FHIRCode,
} from './base.js';

// =============================================================================
// Bundle Resource
// =============================================================================

/** Bundle types */
export type BundleType =
  | 'document'
  | 'message'
  | 'transaction'
  | 'transaction-response'
  | 'batch'
  | 'batch-response'
  | 'history'
  | 'searchset'
  | 'collection';

/** FHIR Bundle - container for collection of resources */
export interface Bundle<T extends Resource = Resource> extends Resource {
  resourceType: 'Bundle';
  identifier?: Identifier;
  type: BundleType;
  timestamp?: FHIRInstant;
  total?: number;
  link?: BundleLink[];
  entry?: BundleEntry<T>[];
  signature?: Signature;
}

/** Bundle link for navigation */
export interface BundleLink {
  relation: string;
  url: FHIRURI;
}

/** Bundle entry containing a resource */
export interface BundleEntry<T extends Resource = Resource> {
  link?: BundleLink[];
  fullUrl?: FHIRURI;
  resource?: T;
  search?: BundleEntrySearch;
  request?: BundleEntryRequest;
  response?: BundleEntryResponse;
}

/** Bundle entry search information */
export interface BundleEntrySearch {
  mode?: 'match' | 'include' | 'outcome';
  score?: number;
}

/** Bundle entry request (for transaction/batch) */
export interface BundleEntryRequest {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: FHIRURI;
  ifNoneMatch?: string;
  ifModifiedSince?: FHIRInstant;
  ifMatch?: string;
  ifNoneExist?: string;
}

/** Bundle entry response (for transaction-response/batch-response) */
export interface BundleEntryResponse {
  status: string;
  location?: FHIRURI;
  etag?: string;
  lastModified?: FHIRInstant;
  outcome?: Resource;
}

// =============================================================================
// E-Rezept Specific Bundle Types
// =============================================================================

/** E-Rezept prescription bundle (simplified KBV_PR_ERP_Bundle) */
export interface ERezeptBundle extends Bundle {
  type: 'document';
  identifier: Identifier & {
    system: 'https://gematik.de/fhir/erp/NamingSystem/GEM_ERP_NS_PrescriptionId';
  };
}

/** German code systems used in E-Rezept */
export const GermanCodeSystems = {
  /** Pharmazentralnummer - unique drug identifier */
  PZN: 'http://fhir.de/CodeSystem/ifa/pzn',
  /** Krankenversichertennummer - health insurance ID */
  KVNR: 'http://fhir.de/sid/gkv/kvid-10',
  /** Lebenslange Arztnummer - physician ID */
  LANR: 'https://fhir.kbv.de/NamingSystem/KBV_NS_Base_ANR',
  /** Zahnarztnummer - dentist ID */
  ZANR: 'https://fhir.kbv.de/NamingSystem/KBV_NS_Base_ZANR',
  /** Institutionskennzeichen - institution ID */
  IK: 'http://fhir.de/sid/arge-ik/iknr',
  /** E-Rezept ID */
  PRESCRIPTION_ID: 'https://gematik.de/fhir/erp/NamingSystem/GEM_ERP_NS_PrescriptionId',
  /** Access code for prescription */
  ACCESS_CODE: 'https://gematik.de/fhir/erp/NamingSystem/GEM_ERP_NS_AccessCode',
} as const;

/** Signature type codes (ASTM E1762-95) */
export const SignatureTypeCodes = {
  /** Author's signature */
  AUTHOR: '1.2.840.10065.1.12.1.1',
  /** Verification signature */
  VERIFICATION: '1.2.840.10065.1.12.1.5',
  /** Validation signature */
  VALIDATION: '1.2.840.10065.1.12.1.6',
  /** Consent signature */
  CONSENT: '1.2.840.10065.1.12.1.7',
} as const;
