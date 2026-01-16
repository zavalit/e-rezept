# E-Rezept Demo Project

> Electronic Prescription System demonstrating German e-health competencies

---

## Implementation Phases

- [x] **Phase 1:** [Project Foundation + FHIR API](./phase1.md)  
      pnpm monorepo, FHIR types, REST endpoints, demo data

- [ ] **Phase 2:** Identity Service (OIDC Simulation)  
      Mock authentication, JWT tokens, role-based access

- [ ] **Phase 3:** PKI + Signature Service  
      CAdES/PKCS#7 signatures, certificate handling, Konnektor simulation

- [ ] **Phase 4:** Security Hardening + Audit Logging  
      Encryption, input validation, rate limiting, audit trails

- [ ] **Phase 5:** Frontend Portals  
      Doctor, Patient, and Pharmacy interfaces (no styling)

---

## Skills Coverage

| Skill                                  | Phase |
| -------------------------------------- | ----- |
| RESTful APIs                           | 1 ✅  |
| HL7 FHIR                               | 1 ✅  |
| Identity Services                      | 2     |
| Signaturdiensten                       | 3     |
| PKI-Systemen                           | 3     |
| Kryptographische Verfahren             | 3, 4  |
| Datenschutz und Informationssicherheit | 4     |

---

## Quick Start

```bash
pnpm install
pnpm dev
# Server: http://localhost:3000
```

---

## Research Documents

- [gematik E-Rezept FHIR Profiles](../docs/research-gematik-erezept-fhir-profiles.md)
- [Signature Requirements (QES, CAdES)](../docs/research-erezept-signature-requirements.md)
- [FHIR Bundle.signature Specification](../docs/research-fhir-bundle-signature.md)
