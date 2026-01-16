# E-Rezept Signaturanforderungen Research

> **Erstellt:** 2026-01-16  
> **Rechtsrahmen:** EU eIDAS Verordnung (910/2014)  
> **Quellen:** gematik, BSI, ETSI

---

## Kurzübersicht

| Aspekt             | Wert                                       |
| ------------------ | ------------------------------------------ |
| **Signaturtyp**    | Qualifizierte Elektronische Signatur (QES) |
| **Rechtsrahmen**   | EU eIDAS Verordnung (910/2014)             |
| **Format**         | CAdES (CMS Advanced Electronic Signatures) |
| **Struktur**       | PKCS#7 Enveloping Signatur                 |
| **Signaturgerät**  | Konnektor (gematik TI Hardware)            |
| **Signaturmittel** | eHBA (elektronischer Heilberufsausweis)    |

---

## eIDAS Signaturhierarchie

```
┌─────────────────────────────────────────────────────────────┐
│                    eIDAS Signaturstufen                     │
├─────────────────────────────────────────────────────────────┤
│  SES (Einfach)     │  Einfache elektronische Signatur       │
│                    │  ❌ Nicht gültig für E-Rezept          │
├────────────────────┼────────────────────────────────────────┤
│  AES (Fortge-      │  Eindeutig dem Unterzeichner zugeordnet│
│  schritten)        │  unter seiner Kontrolle, erkennt       │
│                    │  Änderungen                            │
│                    │  ❌ Nicht gültig für E-Rezept          │
├────────────────────┼────────────────────────────────────────┤
│  QES (Qualifi-     │  Nutzt qualifiziertes Zertifikat +     │
│  ziert)            │  QSCD (Sichere Signaturerstellungs-    │
│                    │  einheit)                              │
│                    │  ✅ ERFORDERLICH für E-Rezept          │
│                    │  = Rechtlich gleichwertig zur          │
│                    │    handschriftlichen Unterschrift      │
└────────────────────┴────────────────────────────────────────┘
```

---

## QES-Anforderungen für E-Rezept

### Erforderliche Komponenten

| Komponente    | Beschreibung                        | Zweck                                               |
| ------------- | ----------------------------------- | --------------------------------------------------- |
| **eHBA**      | Elektronischer Heilberufsausweis    | Persönliche Smartcard mit qualifiziertem Zertifikat |
| **SMC-B**     | Secure Module Card – Betriebsstätte | Institutionskarte (Praxis-Authentifizierung)        |
| **Konnektor** | Sichere Gateway-Hardware            | Erstellt Signaturen, verbindet zur TI               |
| **PVS**       | Praxisverwaltungssystem             | Praxis-Software initiiert Signaturen                |
| **TI-Zugang** | Telematikinfrastruktur-Verbindung   | Sicheres Gesundheitsnetzwerk                        |

> ⚠️ **Wichtig**: Der **eHBA** wird zum Signieren benötigt. Die **SMC-B** allein reicht für die QES NICHT aus!

---

## Signaturformat-Spezifikation

### CAdES (CMS Advanced Electronic Signatures)

```
┌─────────────────────────────────────────────────────────────┐
│                    PKCS#7 Container                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  contentInfo                                          │  │
│  │  ├── contentType: signedData (1.2.840.113549.1.7.2)  │  │
│  │  └── content: SignedData                              │  │
│  │       ├── version: 3                                  │  │
│  │       ├── digestAlgorithms: SHA-256                   │  │
│  │       ├── encapContentInfo (ENVELOPING)               │  │
│  │       │    └── eContent: base64(KBV_PR_ERP_Bundle)   │  │
│  │       ├── certificates: [X.509 Zertifikatskette]     │  │
│  │       └── signerInfos                                 │  │
│  │            ├── signedAttrs                            │  │
│  │            │    ├── contentType                       │  │
│  │            │    ├── messageDigest                     │  │
│  │            │    ├── signingTime                       │  │
│  │            │    └── signingCertificateV2              │  │
│  │            ├── signatureAlgorithm: RSASSA-PSS/ECDSA  │  │
│  │            ├── signature: <Signatur-Bytes>           │  │
│  │            └── unsignedAttrs                          │  │
│  │                 └── OCSP-Antwort (eingebettet)        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technische Parameter

| Parameter               | Wert                                             |
| ----------------------- | ------------------------------------------------ |
| **Standard**            | RFC 5652 (CMS), ETSI TS 103 173 (CAdES Baseline) |
| **Signaturtyp**         | Enveloping (Daten innerhalb der Signatur)        |
| **Hash-Algorithmus**    | SHA-256                                          |
| **Signaturalgorithmus** | RSASSA-PSS oder ECDSA (ECC-Migration läuft)      |
| **OCSP**                | Eingebettet in Signatur (Sperrstatus-Prüfung)    |
| **Kanonisierung**       | Canonical XML 1.1 (für XML-Bundles)              |

---

## Signaturprozess-Ablauf

```
┌──────────────────┐
│   PVS-System     │  1. Arzt erstellt E-Rezept in Praxis-Software
└────────┬─────────┘
         │
         │ 2. KBV_PR_ERP_Bundle vorbereiten (FHIR XML/JSON)
         ▼
┌──────────────────┐
│  Kanonisieren    │  3. Bundle.id, Bundle.meta entfernen
│  Bundle          │     Canonical XML 1.1 anwenden
└────────┬─────────┘
         │
         │ 4. Das kanonisierte Bundle Base64-kodieren
         ▼
┌──────────────────┐     ┌──────────────────┐
│   Konnektor      │────▶│      eHBA        │
│   SignDocument   │     │  (im Kartenleser)│
└────────┬─────────┘     └──────────────────┘
         │                        │
         │ 5. PIN-Eingabe         │ 6. Private-Key-Operation
         │    (oder Komfortsig.)  │
         ▼                        ▼
┌──────────────────────────────────────────┐
│        CAdES-Signatur erstellt           │
│   (PKCS#7 enveloping mit OCSP)           │
└────────────────────┬─────────────────────┘
                     │
                     │ 7. Signiertes Bundle zurückgeben
                     ▼
┌──────────────────────────────────────────┐
│     POST an E-Rezept-Fachdienst          │
│     /Task/{id}/$activate                 │
│     Content-Type: application/pkcs7-mime │
└──────────────────────────────────────────┘
```

---

## Signaturmodi

### 1️⃣ Einzelsignatur

- PIN-Eingabe für **jede** Verordnung
- Am sichersten, aber am langsamsten

### 2️⃣ Stapelsignatur (Batch Signature)

- Signieren von **bis zu 250** Verordnungen pro PIN-Eingabe
- Einzelne Signiersitzung

### 3️⃣ Komfortsignatur

- Eine PIN-Eingabe, gültig für **bis zu 24 Stunden**
- eHBA bleibt im Kartenleser
- **Bis zu 250 Signaturen** ohne erneute PIN-Eingabe
- Erfordert Konnektor PTV4+ Update
- Am praktischsten für Praxen mit hohem Volumen

---

## Konnektor API (Vereinfacht)

### SignDocument Operation

```xml
<!-- Anfrage an Konnektor -->
<SignDocument>
  <CardHandle>{eHBA-Handle}</CardHandle>
  <Crypt>RSA</Crypt>  <!-- oder ECC -->
  <SignatureScheme>RFC-5652</SignatureScheme>
  <SignatureType>urn:ietf:rfc:5652</SignatureType>
  <IncludeRevocationInfo>true</IncludeRevocationInfo>
  <Document>
    <Base64Data MimeType="text/plain; charset=utf-8">
      {base64-kodiertes-kanonisiertes-KBV-Bundle}
    </Base64Data>
  </Document>
</SignDocument>
```

### Antwort

```xml
<SignDocumentResponse>
  <SignedDocument>
    <Base64Signature MimeType="application/pkcs7-mime">
      {base64-kodierte-PKCS7-Signatur}
    </Base64Signature>
  </SignedDocument>
</SignDocumentResponse>
```

---

## Zertifikatskette (PKI-Struktur)

```
┌─────────────────────────────────────────────┐
│           gematik Root CA                   │  (Vertrauensanker)
└───────────────────┬─────────────────────────┘
                    │
    ┌───────────────┴───────────────┐
    ▼                               ▼
┌───────────────┐           ┌───────────────┐
│  Component CA │           │  Component CA │
│   (D-Trust)   │           │ (achelos...)  │
└───────┬───────┘           └───────┬───────┘
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│   eHBA Cert   │           │   SMC-B Cert  │
│  (QES-C.HP)   │           │  (C.HCI.AUT)  │
│  Arzt-ID      │           │  Praxis-ID    │
└───────────────┘           └───────────────┘
```

### Zertifikatprofile auf dem eHBA

| OID          | Zweck                                               |
| ------------ | --------------------------------------------------- |
| **C.HP.QES** | Qualifizierte Elektronische Signatur (für E-Rezept) |
| **C.HP.AUT** | Authentifizierung (für TI-Login)                    |
| **C.HP.ENC** | Verschlüsselung (für sichere Nachrichten)           |

---

## Demo-Projekt Implementierungsstrategie

Für ein Demo-Projekt kann der Signaturprozess **simuliert** werden ohne echte PKI:

### Option 1: Selbstsignierte Zertifikate (Empfohlen für Demo)

```javascript
// Demo-Schlüsselpaar generieren
const { createSign, generateKeyPairSync } = require("crypto");

// Demo-Schlüsselpaar erstellen
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// CMS-Signatur erstellen (vereinfacht)
function signBundle(bundleJson) {
  const sign = createSign("SHA256");
  sign.update(JSON.stringify(bundleJson));
  return sign.sign(privateKey, "base64");
}
```

### Option 2: pkcs7 Bibliothek verwenden

```javascript
import * as forge from "node-forge";

// Enveloping-Signatur erstellen
function createEnvelopingSignature(data, certificate, privateKey) {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(data);
  p7.addCertificate(certificate);
  p7.addSigner({
    key: privateKey,
    certificate: certificate,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() },
    ],
  });
  p7.sign();
  return forge.asn1.toDer(p7.toAsn1()).getBytes();
}
```

### Option 3: Mock-Signaturdienst

```javascript
// Signaturdienst der Konnektor-Verhalten nachahmt
class MockKonnektor {
  async signDocument(bundleBase64, cardHandle) {
    // PIN-Verifizierungsverzögerung simulieren
    await new Promise((r) => setTimeout(r, 500));

    return {
      signedDocument: {
        base64Signature: this.createMockCAdES(bundleBase64),
        mimeType: "application/pkcs7-mime",
      },
      signatureTimestamp: new Date().toISOString(),
      signerInfo: {
        certificateSubject: "CN=Dr. Demo Arzt, O=Demo Praxis",
        validUntil: "2027-01-01",
      },
    };
  }
}
```

---

## Offizielle Standards-Referenzen

| Standard            | Beschreibung                            |
| ------------------- | --------------------------------------- |
| **RFC 5652**        | Cryptographic Message Syntax (CMS)      |
| **ETSI TS 103 173** | CAdES Baseline Profile                  |
| **ETSI TS 101 733** | CAdES Electronic Signature Formats      |
| **eIDAS 910/2014**  | EU Electronic Identification Regulation |
| **BSI TR-03114**    | gematik PKI-Anforderungen               |

---

## Zusammenfassung für Demo

Für ein E-Rezept Demo-Projekt sollten Sie:

1. **Implementieren**: Einen Signaturdienst der PKCS#7/CAdES-ähnliche Strukturen erstellt
2. **Verwenden**: Selbstsignierte X.509-Zertifikate für die Demo
3. **Dokumentieren**: Dass Produktion echten eHBA + Konnektor erfordert
4. **Validieren**: Signaturen mit `node-forge` oder ähnlichen Bibliotheken
5. **Speichern**: Die Signatur in `Bundle.signature` gemäß FHIR-Spezifikation
