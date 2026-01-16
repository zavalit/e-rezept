# E-Rezept Demo - Phase 1 Walkthrough

> **Date:** 2026-01-16  
> **Phase:** 1 - Project Foundation + FHIR API Basics  
> **Status:** ✅ Complete

---

## What Was Built

### pnpm Monorepo Structure

Created a workspace-based monorepo with clear separation:

```
e-health/
├── pnpm-workspace.yaml    # Workspace configuration
├── package.json           # Root package with scripts
├── tsconfig.base.json     # Shared TypeScript config
├── .nvmrc                  # Node 22+ requirement
├── packages/
│   ├── fhir-types/        # FHIR R4 TypeScript types
│   └── fhir-server/       # FHIR store + handlers
├── apps/
│   └── api/               # Fastify REST API server
└── docs/                  # Research documents
```

---

### Package: @e-rezept/fhir-types

TypeScript type definitions for FHIR R4 resources:

| File                                                                                                | Contents                                                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [base.ts](file:///Users/zavalit/Projects/pharma/e-health/packages/fhir-types/src/base.ts)           | Primitive types, Coding, Identifier, Reference, Signature                |
| [resources.ts](file:///Users/zavalit/Projects/pharma/e-health/packages/fhir-types/src/resources.ts) | Patient, Practitioner, Medication, MedicationRequest, MedicationDispense |
| [bundle.ts](file:///Users/zavalit/Projects/pharma/e-health/packages/fhir-types/src/bundle.ts)       | Bundle, German code systems (PZN, KVNR, LANR)                            |

---

### Package: @e-rezept/fhir-server

FHIR resource storage and business logic:

| File                                                                                               | Contents                                                                     |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [store.ts](file:///Users/zavalit/Projects/pharma/e-health/packages/fhir-server/src/store.ts)       | In-memory resource store with CRUD + search                                  |
| [handlers.ts](file:///Users/zavalit/Projects/pharma/e-health/packages/fhir-server/src/handlers.ts) | PatientHandler, PractitionerHandler, MedicationRequestHandler, BundleHandler |

---

### App: @e-rezept/api

Fastify REST API server with FHIR endpoints:

| File                                                                                         | Contents                                            |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [server.ts](file:///Users/zavalit/Projects/pharma/e-health/apps/api/src/server.ts)           | Main Fastify server entry point                     |
| [routes/fhir.ts](file:///Users/zavalit/Projects/pharma/e-health/apps/api/src/routes/fhir.ts) | FHIR REST endpoints for all resources               |
| [seed.ts](file:///Users/zavalit/Projects/pharma/e-health/apps/api/src/seed.ts)               | Demo data (German patients, doctors, prescriptions) |

---

## API Endpoints

| Method         | Endpoint                          | Description                |
| -------------- | --------------------------------- | -------------------------- |
| GET            | `/health`                         | Health check               |
| GET            | `/fhir/metadata`                  | FHIR CapabilityStatement   |
| GET/POST       | `/fhir/Patient`                   | List/Create patients       |
| GET/PUT/DELETE | `/fhir/Patient/:id`               | Read/Update/Delete patient |
| GET/POST       | `/fhir/Practitioner`              | List/Create practitioners  |
| GET            | `/fhir/Practitioner/:id`          | Read practitioner          |
| GET/POST       | `/fhir/MedicationRequest`         | List/Create prescriptions  |
| GET/PUT        | `/fhir/MedicationRequest/:id`     | Read/Update prescription   |
| GET/POST       | `/fhir/Bundle`                    | List/Create bundles        |
| GET            | `/fhir/Bundle/:id`                | Read bundle                |
| POST           | `/fhir/$generate-prescription-id` | Generate E-Rezept ID       |

---

## Verification Results

### Server Startup

```
✓ Demo data seeded:
  - 2 Patients (Max Mustermann, Erika Musterfrau)
  - 2 Practitioners (Dr. Schmidt, Dr. Müller)
  - 2 Prescriptions (Ibuprofen, Amoxicillin)

╔════════════════════════════════════════════════════════════════╗
║                    E-Rezept Demo API                           ║
╠════════════════════════════════════════════════════════════════╣
║  Server:    http://0.0.0.0:3000                                ║
║  FHIR:      http://0.0.0.0:3000/fhir                           ║
║  Metadata:  http://0.0.0.0:3000/fhir/metadata                  ║
║  Health:    http://0.0.0.0:3000/health                         ║
╚════════════════════════════════════════════════════════════════╝
```

---

## How to Run

```bash
# Install dependencies
pnpm install

# Build packages
pnpm --filter @e-rezept/fhir-types build
pnpm --filter @e-rezept/fhir-server build

# Start development server
pnpm dev
```

---

## Skills Demonstrated

| Skill               | Implementation                                                                  |
| ------------------- | ------------------------------------------------------------------------------- |
| ✅ **RESTful APIs** | Fastify FHIR endpoints with proper HTTP methods and status codes                |
| ✅ **HL7 FHIR**     | Patient, Practitioner, MedicationRequest, Bundle resources with German profiles |
