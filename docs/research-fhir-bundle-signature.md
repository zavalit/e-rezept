# FHIR Bundle.signature Element Specification Research

> **Created:** 2026-01-16  
> **FHIR Version:** R4 (Release 4.0.1)  
> **Source:** HL7 FHIR Specification

---

## Overview

The `Bundle.signature` element in HL7 FHIR R4 provides a mechanism for digitally signing a Bundle resource. This element uses the `Signature` datatype, which can represent both cryptographic digital signatures (XML DigSig or JWS) and graphical images of signatures.

---

## Bundle Resource Structure

The `Bundle.signature` element is defined at the root level of the Bundle resource:

```
Bundle
├── id
├── meta
├── identifier
├── type (document | message | transaction | ...)
├── timestamp
├── total
├── link[]
├── entry[]
│   ├── fullUrl
│   ├── resource
│   ├── search
│   ├── request
│   └── response
└── signature  ← Signature datatype
```

---

## Signature Datatype Structure

| Element          | Cardinality | Type             | Description                                      |
| ---------------- | ----------- | ---------------- | ------------------------------------------------ |
| **type**         | 1..\*       | Coding           | Indication of the reason the entity signed       |
| **when**         | 1..1        | instant          | When the signature was created                   |
| **who**          | 1..1        | Reference        | Who signed (Practitioner, Patient, Device, etc.) |
| **onBehalfOf**   | 0..1        | Reference        | The party represented by the signature           |
| **targetFormat** | 0..1        | code (MIME type) | Technical format of the signed resources         |
| **sigFormat**    | 0..1        | code (MIME type) | Technical format of the signature itself         |
| **data**         | 0..1        | base64Binary     | The actual signature content                     |

---

## Key Elements Explained

### type (Signature Type Codes)

Indicates the reason/purpose for the signature. Uses the [SignatureTypeCodes](https://hl7.org/fhir/R4/valueset-signature-type.html) ValueSet:

| Code                      | Display                             | Description                   |
| ------------------------- | ----------------------------------- | ----------------------------- |
| `1.2.840.10065.1.12.1.1`  | Author's Signature                  | Signature of the author       |
| `1.2.840.10065.1.12.1.2`  | Coauthor's Signature                | Signature of a coauthor       |
| `1.2.840.10065.1.12.1.3`  | Co-participant's Signature          | Signature of a co-participant |
| `1.2.840.10065.1.12.1.4`  | Transcriptionist/Recorder Signature | Signature of transcriptionist |
| `1.2.840.10065.1.12.1.5`  | Verification Signature              | Signature for verification    |
| `1.2.840.10065.1.12.1.6`  | Validation Signature                | Signature for validation      |
| `1.2.840.10065.1.12.1.7`  | Consent Signature                   | Signature for consent         |
| `1.2.840.10065.1.12.1.8`  | Signature Witness Signature         | Witness to signature          |
| `1.2.840.10065.1.12.1.9`  | Event Witness Signature             | Witness to event              |
| `1.2.840.10065.1.12.1.10` | Identity Witness Signature          | Witness to identity           |
| `1.2.840.10065.1.12.1.11` | Consent Witness Signature           | Witness to consent            |
| `1.2.840.10065.1.12.1.12` | Interpreter Signature               | Interpreter signature         |
| `1.2.840.10065.1.12.1.13` | Review Signature                    | Review signature              |
| `1.2.840.10065.1.12.1.14` | Source Signature                    | Source signature              |
| `1.2.840.10065.1.12.1.15` | Addendum Signature                  | Addendum signature            |
| `1.2.840.10065.1.12.1.16` | Modification Signature              | Modification signature        |
| `1.2.840.10065.1.12.1.17` | Administrative Signature            | Administrative signature      |
| `1.2.840.10065.1.12.1.18` | Timestamp Signature                 | Timestamp signature           |

### who (Signer Reference)

A reference to an application-usable description of the identity that signed:

- `Practitioner` - Healthcare provider
- `PractitionerRole` - Provider in a specific role
- `Patient` - The patient themselves
- `RelatedPerson` - Related person (guardian, etc.)
- `Device` - Automated device signature
- `Organization` - Organizational signature

### targetFormat

The MIME type of the **target resources** that were signed:

| Value                   | Description                   |
| ----------------------- | ----------------------------- |
| `application/fhir+xml`  | FHIR resources in XML format  |
| `application/fhir+json` | FHIR resources in JSON format |

### sigFormat

The MIME type of the **signature itself**:

| Value                         | Description                     |
| ----------------------------- | ------------------------------- |
| `application/signature+xml`   | XML Digital Signature (XMLDSig) |
| `application/jose`            | JSON Web Signature (JWS)        |
| `application/pkcs7-signature` | PKCS#7/CMS Signature            |
| `image/*`                     | Graphical image of signature    |

### data

The actual signature content, base64-encoded. The content format depends on `sigFormat`:

- For XML DigSig: Base64-encoded XML Digital Signature
- For JWS: Base64-encoded JWS-Signature (RFC 7515)
- For PKCS#7: Base64-encoded CMS/PKCS#7 signature
- For images: Base64-encoded image data

---

## XML Signature Rules

When `sigFormat = application/signature+xml`:

1. `Signature.data` is base64-encoded XML-Signature
2. The XML-Signature is a **Detached Signature** (content separate from signature)
3. Signature SHOULD conform to **XAdES-X-L** for Long Term signatures
4. When FHIR Resources are signed, signature is across **Canonical XML form**
5. Signature SHOULD use **SHA-256** hashing algorithm
6. Signature SHALL include `CommitmentTypeIndication` element for signature purpose

### Verification Levels

1. Verify Digital Signature block integrity
2. Confirm signer authenticity, non-revocation, and appropriateness
3. Confirm signed content is unmodified using hash algorithm

---

## JSON Signature Rules (JWS)

When `sigFormat = application/jose`:

1. `Signature.data` is base64-encoded JWS-Signature (RFC 7515)
2. The signature is a **Detached Signature**
3. When FHIR Resources are signed, signature is across **Canonical JSON form**
4. Signature SHOULD use **SHA-256** hashing algorithm
5. Signature SHALL include `CommitmentTypeIndication` element

---

## Example: Bundle with Signature (JSON)

```json
{
  "resourceType": "Bundle",
  "id": "prescription-bundle-001",
  "type": "document",
  "timestamp": "2026-01-16T10:30:00+01:00",
  "entry": [
    {
      "fullUrl": "urn:uuid:composition-001",
      "resource": {
        "resourceType": "Composition"
        // ... composition content
      }
    },
    {
      "fullUrl": "urn:uuid:medicationrequest-001",
      "resource": {
        "resourceType": "MedicationRequest"
        // ... prescription content
      }
    }
  ],
  "signature": {
    "type": [
      {
        "system": "urn:iso-astm:E1762-95:2013",
        "code": "1.2.840.10065.1.12.1.1",
        "display": "Author's Signature"
      }
    ],
    "when": "2026-01-16T10:30:00+01:00",
    "who": {
      "reference": "Practitioner/dr-smith-001",
      "display": "Dr. Anna Schmidt"
    },
    "targetFormat": "application/fhir+json",
    "sigFormat": "application/pkcs7-signature",
    "data": "MIIGXAYJKoZIhvcNAQcCoIIGTTCCBkkCAQExDzAN..."
  }
}
```

---

## Example: Bundle with Signature (XML)

```xml
<Bundle xmlns="http://hl7.org/fhir">
  <id value="prescription-bundle-001"/>
  <type value="document"/>
  <timestamp value="2026-01-16T10:30:00+01:00"/>
  <entry>
    <fullUrl value="urn:uuid:composition-001"/>
    <resource>
      <Composition>
        <!-- composition content -->
      </Composition>
    </resource>
  </entry>
  <entry>
    <fullUrl value="urn:uuid:medicationrequest-001"/>
    <resource>
      <MedicationRequest>
        <!-- prescription content -->
      </MedicationRequest>
    </resource>
  </entry>
  <signature>
    <type>
      <system value="urn:iso-astm:E1762-95:2013"/>
      <code value="1.2.840.10065.1.12.1.1"/>
      <display value="Author's Signature"/>
    </type>
    <when value="2026-01-16T10:30:00+01:00"/>
    <who>
      <reference value="Practitioner/dr-smith-001"/>
      <display value="Dr. Anna Schmidt"/>
    </who>
    <targetFormat value="application/fhir+xml"/>
    <sigFormat value="application/signature+xml"/>
    <data value="PFNpZ25hdHVyZSB4bWxucz0iaHR0cDovL3d3dy53..."/>
  </signature>
</Bundle>
```

---

## Canonicalization for Signing

Before signing FHIR resources, canonicalization ensures consistent representation:

### XML Canonicalization (Canonical XML 1.1)

- Remove `Bundle.id` and `Bundle.meta` before signing
- Apply standard XML canonicalization rules
- Preserve namespace declarations

### JSON Canonicalization

- Remove `Bundle.id` and `Bundle.meta` before signing
- Apply canonical JSON ordering
- No whitespace formatting

---

## gematik E-Rezept Specifics

For German E-Rezept, the signature approach differs slightly:

| Aspect                 | Standard FHIR              | gematik E-Rezept                   |
| ---------------------- | -------------------------- | ---------------------------------- |
| **Signature Location** | `Bundle.signature` element | PKCS#7 enveloping container        |
| **Format**             | Detached signature         | Enveloping signature (data inside) |
| **Content**            | Bundle reference           | Complete Bundle embedded           |
| **Transport**          | JSON/XML with signature    | PKCS#7 file with MIME type         |

### gematik Flow

1. Create `KBV_PR_ERP_Bundle` (FHIR Bundle)
2. Canonicalize the Bundle (remove id, meta)
3. Base64-encode the canonicalized Bundle
4. Sign via Konnektor → Creates PKCS#7 enveloping signature
5. POST PKCS#7 to E-Rezept Fachdienst
6. Fachdienst stores and returns with `Bundle.signature` populated

---

## Implementation in Node.js

### Creating a FHIR Signature

```javascript
import * as forge from "node-forge";
import * as crypto from "crypto";

function createFHIRSignature(bundle, privateKey, certificate, practitionerRef) {
  // 1. Remove id and meta for canonicalization
  const canonicalBundle = { ...bundle };
  delete canonicalBundle.id;
  delete canonicalBundle.meta;

  // 2. Serialize to canonical JSON
  const canonicalJson = JSON.stringify(canonicalBundle);

  // 3. Create signature
  const sign = crypto.createSign("SHA256");
  sign.update(canonicalJson);
  const signatureData = sign.sign(privateKey, "base64");

  // 4. Build Signature element
  return {
    type: [
      {
        system: "urn:iso-astm:E1762-95:2013",
        code: "1.2.840.10065.1.12.1.1",
        display: "Author's Signature",
      },
    ],
    when: new Date().toISOString(),
    who: {
      reference: practitionerRef,
    },
    targetFormat: "application/fhir+json",
    sigFormat: "application/jose",
    data: signatureData,
  };
}

// Usage
const signedBundle = {
  ...originalBundle,
  signature: createFHIRSignature(
    originalBundle,
    doctorPrivateKey,
    doctorCertificate,
    "Practitioner/dr-smith-001"
  ),
};
```

### Verifying a FHIR Signature

```javascript
function verifyFHIRSignature(bundle) {
  const { signature, ...bundleWithoutSignature } = bundle;

  // 1. Prepare canonical form
  const canonicalBundle = { ...bundleWithoutSignature };
  delete canonicalBundle.id;
  delete canonicalBundle.meta;

  const canonicalJson = JSON.stringify(canonicalBundle);

  // 2. Get public key from 'who' reference
  const publicKey = getPublicKeyForPractitioner(signature.who.reference);

  // 3. Verify signature
  const verify = crypto.createVerify("SHA256");
  verify.update(canonicalJson);

  return verify.verify(publicKey, signature.data, "base64");
}
```

---

## Resources Where Signature is Used

The FHIR `Signature` datatype is used in:

| Resource               | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| **Bundle**             | Sign entire document bundles                      |
| **Contract**           | Legal contract signatures                         |
| **Provenance**         | Sign provenance records (preferred method in R6+) |
| **VerificationResult** | Sign verification outcomes                        |

---

## Future Direction (FHIR R6+)

> ⚠️ **Note**: In FHIR R6 and later, `Bundle.signature` is **deprecated**. The recommended approach is to use **Provenance-based signatures** where the signature is contained in a `Provenance` resource that targets the Bundle.

---

## Official References

| Resource                  | URL                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Bundle Resource**       | [hl7.org/fhir/R4/bundle.html](https://hl7.org/fhir/R4/bundle.html)                                   |
| **Signature Datatype**    | [hl7.org/fhir/R4/datatypes.html#Signature](https://hl7.org/fhir/R4/datatypes.html#Signature)         |
| **Signature Type Codes**  | [hl7.org/fhir/R4/valueset-signature-type.html](https://hl7.org/fhir/R4/valueset-signature-type.html) |
| **XML Digital Signature** | [w3.org/TR/xmldsig-core1](https://www.w3.org/TR/xmldsig-core1/)                                      |
| **JSON Web Signature**    | [RFC 7515](https://tools.ietf.org/html/rfc7515)                                                      |
