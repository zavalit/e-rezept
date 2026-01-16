# Offizielles gematik E-Rezept FHIR Profil Research

> **Erstellt:** 2026-01-16  
> **FHIR Version:** R4 (Release 4.0.1)  
> **Quellen:** gematik, KBV, Simplifier.net

---

## Übersicht

Das deutsche E-Rezept-System basiert auf dem HL7 FHIR R4 Standard und wird hauptsächlich von zwei Organisationen spezifiziert:

| Organisation | Verantwortungsbereich                | Namespace                                  |
| ------------ | ------------------------------------ | ------------------------------------------ |
| **gematik**  | Workflow, Transport, Task-Management | `https://gematik.de/fhir/erp/`             |
| **KBV**      | Klinische Inhalte, Verordnungsdaten  | `https://fhir.kbv.de/StructureDefinition/` |

---

## Primäre FHIR-Pakete

| Paket                            | Version | Beschreibung                    |
| -------------------------------- | ------- | ------------------------------- |
| `de.gematik.erezept-workflow.r4` | 1.3.x   | E-Rezept Workflow Spezifikation |
| `kbv.ita.erp`                    | 1.3.3   | KBV eRezept Profile             |
| `de.basisprofil.r4`              | 1.3.2   | Deutsche FHIR Basisprofile      |

---

## KBV-Profile (Verordnungsinhalte)

### Hauptprofile

| Profil                        | Basis-Ressource     | Zweck                                          |
| ----------------------------- | ------------------- | ---------------------------------------------- |
| **`KBV_PR_ERP_Bundle`**       | `Bundle`            | Container für alle Verordnungsressourcen       |
| **`KBV_PR_ERP_Prescription`** | `MedicationRequest` | Die eigentliche Verordnung                     |
| **`KBV_PR_ERP_Medication_*`** | `Medication`        | Arzneimitteldetails (PZN, Rezeptur, Wirkstoff) |
| **`KBV_PR_FOR_Patient`**      | `Patient`           | Patient mit KVNR                               |
| **`KBV_PR_FOR_Practitioner`** | `Practitioner`      | Arzt mit LANR/ZANR                             |
| **`KBV_PR_FOR_Organization`** | `Organization`      | Praxis/Krankenhaus                             |
| **`KBV_PR_FOR_Coverage`**     | `Coverage`          | Versicherungsinformationen                     |

### KBV_PR_ERP_Bundle Struktur

```
KBV_PR_ERP_Bundle (type: document)
├── identifier: PrescriptionID
│   └── system: https://gematik.de/fhir/erp/NamingSystem/GEM_ERP_NS_PrescriptionId
├── timestamp
├── signature (optional, für signierte Bundles)
└── entry[]
    ├── Composition (KBV_PR_ERP_Composition)
    ├── MedicationRequest (KBV_PR_ERP_Prescription)
    ├── Medication (KBV_PR_ERP_Medication_PZN / _Compounding / _FreeText / _Ingredient)
    ├── Patient (KBV_PR_FOR_Patient)
    ├── Practitioner (KBV_PR_FOR_Practitioner)
    ├── Organization (KBV_PR_FOR_Organization)
    └── Coverage (KBV_PR_FOR_Coverage)
```

### Beispiel: KBV_PR_ERP_Prescription (MedicationRequest)

```json
{
  "resourceType": "MedicationRequest",
  "id": "rx-001",
  "meta": {
    "profile": [
      "https://fhir.kbv.de/StructureDefinition/KBV_PR_ERP_Prescription|1.3.3"
    ]
  },
  "extension": [
    {
      "url": "https://fhir.kbv.de/StructureDefinition/KBV_EX_ERP_EmergencyServicesFee",
      "valueBoolean": false
    },
    {
      "url": "https://fhir.kbv.de/StructureDefinition/KBV_EX_ERP_BVG",
      "valueBoolean": false
    },
    {
      "url": "https://fhir.kbv.de/StructureDefinition/KBV_EX_FOR_StatusCoPayment",
      "valueCoding": {
        "system": "https://fhir.kbv.de/CodeSystem/KBV_CS_FOR_StatusCoPayment",
        "code": "0"
      }
    }
  ],
  "status": "active",
  "intent": "order",
  "medicationReference": {
    "reference": "Medication/med-001"
  },
  "subject": {
    "reference": "Patient/patient-001"
  },
  "authoredOn": "2026-01-16",
  "requester": {
    "reference": "Practitioner/practitioner-001"
  },
  "insurance": [
    {
      "reference": "Coverage/coverage-001"
    }
  ],
  "dosageInstruction": [
    {
      "extension": [
        {
          "url": "https://fhir.kbv.de/StructureDefinition/KBV_EX_ERP_DosageFlag",
          "valueBoolean": true
        }
      ],
      "text": "1-0-1"
    }
  ],
  "dispenseRequest": {
    "quantity": {
      "value": 1,
      "system": "http://unitsofmeasure.org",
      "code": "{Package}"
    }
  },
  "substitution": {
    "allowedBoolean": true
  }
}
```

---

## gematik-Profile (Workflow)

### Hauptprofile

| Profil                              | Basis-Ressource      | Zweck                                 |
| ----------------------------------- | -------------------- | ------------------------------------- |
| **`GEM_ERP_PR_Task`**               | `Task`               | Workflow-Zustandsmaschine             |
| **`GEM_ERP_PR_MedicationDispense`** | `MedicationDispense` | Apothekenabgabe                       |
| **`GEM_ERP_PR_Communication_*`**    | `Communication`      | Nachrichten zwischen Akteuren         |
| **`GEM_ERP_PR_Bundle`**             | `Bundle`             | Transport signierter Verordnungen     |
| **`GEM_ERP_PR_Consent`**            | `Consent`            | PKV-Einwilligung zur Datenspeicherung |

### E-Rezept Workflow (Task-Zustände)

```
┌──────────────┐
│    draft     │  ← Task erstellt durch Arztsystem
└──────┬───────┘
       │ $activate (mit signiertem KBV Bundle)
       ▼
┌──────────────┐
│    ready     │  ← Verordnung bereit zur Abholung
└──────┬───────┘
       │ $accept (durch Apotheke, mit AccessCode)
       ▼
┌──────────────┐
│  in-progress │  ← Apotheke in Bearbeitung
└──────┬───────┘
       │ $close (mit MedicationDispense)
       ▼
┌──────────────┐
│  completed   │  ← Abgegeben, Quittung verfügbar
└──────────────┘
```

---

## Wichtige deutsche Kodesysteme

| System          | URL                                                                  | Zweck                                 |
| --------------- | -------------------------------------------------------------------- | ------------------------------------- |
| **PZN**         | `http://fhir.de/CodeSystem/ifa/pzn`                                  | Pharmazentralnummer (Arzneimittel-ID) |
| **KVNR**        | `http://fhir.de/sid/gkv/kvid-10`                                     | Krankenversichertennummer             |
| **LANR**        | `https://fhir.kbv.de/NamingSystem/KBV_NS_Base_ANR`                   | Lebenslange Arztnummer                |
| **IK**          | `http://fhir.de/sid/arge-ik/iknr`                                    | Institutionskennzeichen               |
| **E-Rezept-ID** | `https://gematik.de/fhir/erp/NamingSystem/GEM_ERP_NS_PrescriptionId` | E-Rezept ID (160.xxx.xxx.xxx)         |

---

## Offizielle Ressourcen

| Ressource                     | URL                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| **gematik API-Dokumentation** | [github.com/gematik/api-erp](https://github.com/gematik/api-erp)                   |
| **gematik FHIR-Profile**      | [simplifier.net/erezept-workflow](https://simplifier.net/erezept-workflow)         |
| **KBV eRezept-Profile**       | [simplifier.net/kbv.ita.erp](https://simplifier.net/kbv.ita.erp)                   |
| **Beispielressourcen**        | [github.com/gematik/eRezept-Examples](https://github.com/gematik/eRezept-Examples) |
| **DE Basisprofile**           | [simplifier.net/basisprofil-de-r4](https://simplifier.net/basisprofil-de-r4)       |

---

## Für Demo-Projekte

### Vereinfachter Demo-Scope

| Offizielles Profil        | Demo-Äquivalent                                      |
| ------------------------- | ---------------------------------------------------- |
| `KBV_PR_ERP_Bundle`       | Vereinfachtes Bundle mit MedicationRequest + Patient |
| `KBV_PR_ERP_Prescription` | Vereinfachter MedicationRequest mit PZN              |
| `GEM_ERP_PR_Task`         | Task-Workflow-Simulation                             |
| PKI/QES Signatur          | Self-signed Zertifikate Demo                         |

### Empfohlener Ansatz

1. **Offizielle FHIR-Pakete** zur Validierung nutzen: `de.gematik.erezept-workflow.r4`
2. **Vereinfachte Versionen** implementieren, die die Konzepte demonstrieren
3. **Abweichungen** von offiziellen Profilen für Demo-Zwecke dokumentieren
