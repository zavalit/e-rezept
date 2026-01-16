/**
 * Seed Demo Data
 * Pre-populates the FHIR store with sample German healthcare data
 */

import { GermanCodeSystems } from '@e-rezept/fhir-types';
import {
  patientHandler,
  practitionerHandler,
  medicationRequestHandler,
} from '@e-rezept/fhir-server';

export async function seedDemoData(): Promise<void> {
  // ==========================================================================
  // Demo Patients
  // ==========================================================================

  const patient1 = await patientHandler.create({
    id: 'patient-max-mustermann',
    active: true,
    identifier: [
      {
        system: GermanCodeSystems.KVNR,
        value: 'X123456789',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'Mustermann',
        given: ['Max'],
        prefix: ['Herr'],
      },
    ],
    gender: 'male',
    birthDate: '1985-03-15',
    address: [
      {
        use: 'home',
        line: ['Musterstraße 123'],
        city: 'Berlin',
        postalCode: '10115',
        country: 'DE',
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+49 30 123456789',
        use: 'home',
      },
      {
        system: 'email',
        value: 'max.mustermann@example.de',
      },
    ],
  });

  const patient2 = await patientHandler.create({
    id: 'patient-erika-musterfrau',
    active: true,
    identifier: [
      {
        system: GermanCodeSystems.KVNR,
        value: 'Y987654321',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'Musterfrau',
        given: ['Erika'],
        prefix: ['Frau'],
      },
    ],
    gender: 'female',
    birthDate: '1990-07-22',
    address: [
      {
        use: 'home',
        line: ['Beispielweg 45'],
        city: 'München',
        postalCode: '80331',
        country: 'DE',
      },
    ],
  });

  // ==========================================================================
  // Demo Practitioners (Doctors)
  // ==========================================================================

  const practitioner1 = await practitionerHandler.create({
    id: 'practitioner-dr-schmidt',
    active: true,
    identifier: [
      {
        system: GermanCodeSystems.LANR,
        value: '123456789',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'Schmidt',
        given: ['Anna'],
        prefix: ['Dr. med.'],
      },
    ],
    gender: 'female',
    qualification: [
      {
        code: {
          coding: [
            {
              system: 'http://fhir.de/CodeSystem/qualifikation',
              code: 'FA',
              display: 'Fachärztin für Allgemeinmedizin',
            },
          ],
        },
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+49 30 987654321',
        use: 'work',
      },
    ],
    address: [
      {
        use: 'work',
        line: ['Praxisstraße 1'],
        city: 'Berlin',
        postalCode: '10117',
        country: 'DE',
      },
    ],
  });

  const practitioner2 = await practitionerHandler.create({
    id: 'practitioner-dr-mueller',
    active: true,
    identifier: [
      {
        system: GermanCodeSystems.LANR,
        value: '987654321',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'Müller',
        given: ['Thomas'],
        prefix: ['Dr. med.'],
      },
    ],
    gender: 'male',
    qualification: [
      {
        code: {
          coding: [
            {
              system: 'http://fhir.de/CodeSystem/qualifikation',
              code: 'FA',
              display: 'Facharzt für Innere Medizin',
            },
          ],
        },
      },
    ],
  });

  // ==========================================================================
  // Demo MedicationRequests (Prescriptions)
  // ==========================================================================

  await medicationRequestHandler.create({
    id: 'prescription-001',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      coding: [
        {
          system: GermanCodeSystems.PZN,
          code: '04773414',
          display: 'Ibuprofen 400mg Filmtabletten',
        },
      ],
      text: 'Ibuprofen 400mg Filmtabletten',
    },
    subject: {
      reference: `Patient/${patient1.id}`,
      display: 'Max Mustermann',
    },
    requester: {
      reference: `Practitioner/${practitioner1.id}`,
      display: 'Dr. med. Anna Schmidt',
    },
    authoredOn: new Date().toISOString().split('T')[0],
    dosageInstruction: [
      {
        text: '1-0-1 (morgens und abends je 1 Tablette)',
        timing: {
          repeat: {
            frequency: 2,
            period: 1,
            periodUnit: 'd',
          },
        },
      },
    ],
    dispenseRequest: {
      quantity: {
        value: 20,
        unit: 'Tabletten',
        system: 'http://unitsofmeasure.org',
        code: '{tbl}',
      },
    },
    substitution: {
      allowedBoolean: true,
    },
  });

  await medicationRequestHandler.create({
    id: 'prescription-002',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      coding: [
        {
          system: GermanCodeSystems.PZN,
          code: '02588457',
          display: 'Amoxicillin 500mg Kapseln',
        },
      ],
      text: 'Amoxicillin 500mg Kapseln',
    },
    subject: {
      reference: `Patient/${patient2.id}`,
      display: 'Erika Musterfrau',
    },
    requester: {
      reference: `Practitioner/${practitioner2.id}`,
      display: 'Dr. med. Thomas Müller',
    },
    authoredOn: new Date().toISOString().split('T')[0],
    dosageInstruction: [
      {
        text: '1-1-1 (dreimal täglich 1 Kapsel)',
        timing: {
          repeat: {
            frequency: 3,
            period: 1,
            periodUnit: 'd',
          },
        },
      },
    ],
    dispenseRequest: {
      quantity: {
        value: 21,
        unit: 'Kapseln',
        system: 'http://unitsofmeasure.org',
        code: '{caps}',
      },
      expectedSupplyDuration: {
        value: 7,
        unit: 'days',
        system: 'http://unitsofmeasure.org',
        code: 'd',
      },
    },
    substitution: {
      allowedBoolean: false,
    },
  });

  console.log('✓ Demo data seeded:');
  console.log('  - 2 Patients (Max Mustermann, Erika Musterfrau)');
  console.log('  - 2 Practitioners (Dr. Schmidt, Dr. Müller)');
  console.log('  - 2 Prescriptions (Ibuprofen, Amoxicillin)');
}
