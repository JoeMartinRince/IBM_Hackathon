# VERIFAI — System Architecture Document

**Challenge 3**: Export Document Verification System  
**Hackathon**: IBM x Government of Kerala — KeralAI Hackathon 2026  
**Platform**: VERIFAI (AI-Powered Export Document Verification & Readiness Platform)

---

## 1. High-Level Architecture Overview

VERIFAI is an end-to-end export documentation verification platform designed to eliminate customs clearance delays, discrepancies, and compliance penalties across Kerala's primary maritime gateways (**Cochin Sea Port - INCOK** and **Vizhinjam International Transshipment Deepwater Terminal - INVIZ**).

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER                                   |
|  TanStack Start / React 19 / TypeScript / Tailwind CSS v4 / Framer Motion / Lucide     |
|                                                                                       |
|  - AppShell & Navigation (Desktop Sidebar + Mobile Floating Bar)                      |
|  - Multilingual Support (English, Malayalam മലയാളം, Hindi हिन्दी)                     |
|  - Multi-File Drag-and-Drop Ingestion Dropzone                                         |
|  - Cross-Document Discrepancy Matrix & 1-Click Fix with Audit Trail                  |
|  - Consensus Golden Record View & Conflict Resolution                                 |
|  - Customs Query Simulator (Likelihood % & Pre-Drafted Rebuttals)                     |
|  - Deterministic Readiness Ring (0 - 100%) & Printable Verification Certificate       |
|  - Tamper-Evident QR Code & Public Verification Status Portal                         |
|  - Natural Language Assistant with Grounded Citations                                 |
+-------------------------------------------+-------------------------------------------+
                                            |
                              /api Proxy (Port 8080 -> 3001)
                                            |
+-------------------------------------------v-------------------------------------------+
|                                      API GATEWAY                                      |
|  Express.js / TypeScript / RESTful Routers / Multer Multipart / Zod Validation        |
|                                                                                       |
|  - /api/shipments          - /api/documents          - /api/verification             |
|  - /api/golden-record      - /api/customs-risk       - /api/assistant                |
|  - /api/insights           - /api/verify-status/:tok - /api/health                   |
+-------------------------------------------+-------------------------------------------+
                                            |
         +----------------------------------+----------------------------------+
         |                                                                     |
+--------v---------------------------------+                 +-----------------v--------+
|       PIPELINE & INGESTION LAYER         |                 |    VERIFICATION & AI     |
|                                          |                 |          ENGINE          |
| 1. Document Classifier:                  |                 |                          |
|    - Keyword + Regex classification      |                 | 1. Deterministic Cross-  |
|    - Commercial Invoice, Packing List,   |                 |    Document Engine:      |
|      Shipping Bill, Bill of Lading, PO,  |                 |    - Unit normalization  |
|      Certificate of Origin, Phytosanitary|                 |    - Container ISO 6346  |
|                                          |                 |      checksum modulus    |
| 2. File Parsers:                         |                 |    - Net vs Gross bounds |
|    - PDF (pdf-parse / text stream)       |                 |    - Currency conversion |
|    - Excel/Sheets (xlsx tabular parse)   |                 |    - Chronology logic    |
|    - Word/Docs (mammoth docx reader)     |                 |                          |
|    - Images/Scans (Tesseract.js OCR)     |                 | 2. Golden Record Engine: |
|                                          |                 |    - Hierarchy consensus |
| 3. Structured Data Extractor:            |                 |    - Confidence scoring  |
|    - Normalized JSON schema output       |                 |    - Audit trail logs    |
|    - Confidence score per field          |                 |                          |
|    - Bounding box / page tracking        |                 | 3. Customs Simulator:    |
|                                          |                 |    - Kerala rulebase     |
+------------------------------------------+                 |    - Query likelihood %  |
                                                             |    - Notice generation   |
                                                             |                          |
                                                             | 4. Retrieval Assistant:  |
                                                             |    - Grounded Q&A        |
                                                             |    - Source citations    |
                                                             +-----------------+--------+
                                                                               |
+------------------------------------------------------------------------------v--------+
|                                    PERSISTENCE LAYER                                  |
|                                                                                       |
|  - Dual Mode Operation:                                                               |
|    * Live Mode: PostgreSQL relational schema (pg / connection pool)                   |
|    * Demo Mode: Resilient high-speed in-memory store pre-seeded with authentic        |
|      Kerala maritime export shipments (Shrimp, Cardamom, Coir, Rubber, Tea)          |
+---------------------------------------------------------------------------------------+
```

---

## 2. Ingestion & Document Pipeline

When a user drops shipment paperwork into `/verify`:

1. **Storage & Validation**:
   - Files are validated by MIME type (PDF, PNG, JPG, XLSX, DOCX) and size (limit: 25 MB).
   - Saved to `uploads/` directory with unique UUID prefixes.
2. **Document Classification**:
   - `classifier.ts` inspects headers, keywords, and structural patterns.
   - Computes weighted score across 7 export document archetypes:
     - `COMMERCIAL_INVOICE`
     - `PACKING_LIST`
     - `SHIPPING_BILL`
     - `BILL_OF_LADING`
     - `CERTIFICATE_OF_ORIGIN`
     - `PURCHASE_ORDER`
     - `PHYTOSANITARY_CERTIFICATE` / `HEALTH_CERTIFICATE`
3. **Multi-Format Parsing**:
   - PDFs parsed via `pdf-parse` with page stream fallback.
   - Spreadsheets parsed via `xlsx` sheet iteration.
   - Word files converted via `mammoth`.
   - Scanned receipts/documents run through `tesseract.js` OCR.
4. **Field Extraction**:
   - `extractor.ts` regex and heuristic rules extract standard schema:
     - Document Number & Date
     - Exporter & Consignee Name / Tax ID (IEC / GSTIN)
     - Port of Loading (e.g., INCOK) & Port of Discharge (e.g., AEJEA, USNYC)
     - Line Items, Product Description & HS Code (6-8 digits)
     - Quantities, Unit of Measure, Net Weight, Gross Weight
     - Currency, Unit Price, Line Total, Invoice Total
     - Container Number & Seal Number

---

## 3. Verification & Discrepancy Engine

The verification engine (`server/engine/verification.ts`) executes a deterministic 7-stage evaluation pipeline:

### 3.1 Unit of Measure & Quantity Normalization

- Converts all units to metric base units (e.g., `MT` $\rightarrow \times 1,000$ `KG`, `LBS` $\rightarrow \times 0.45359237$ `KG`).
- Flags discrepancies where package quantities or weights vary across Commercial Invoice, Packing List, and Shipping Bill by more than $0.05\%$.

### 3.2 ISO 6346 Container Checksum Verification

- Computes container number check digit using ISO 6346 standard algorithm:
  $$\text{Check Digit} = \left( \sum_{i=0}^{9} \text{CharValue}(c_i) \cdot 2^i \right) \pmod{11} \pmod{10}$$
- Immediately flags invalid container codes before port gate arrival, avoiding costly terminal rejection fees.

### 3.3 Physical Plausibility Verification

- Enforces strict invariant:
  $$\text{Gross Weight} \ge \text{Net Weight} + \text{Tare Weight}$$
- Validates that carton quantity multiplied by average unit weight correlates with total net weight.

### 3.4 Export Chronology & Date Invariants

- Validates the logical sequence of trade dates:
  $$\text{PO Date} \le \text{Commercial Invoice Date} \le \text{Shipping Bill Date} \le \text{Bill of Lading Date}$$
- Flags expired regulatory certificates (e.g., MPEDA Health Certificates valid for 30 days).

### 3.5 Tariff & HS Code Validation

- Validates 6-to-8 digit Harmonized System classification consistency across documents.
- Checks commodity-specific regulatory mandates (e.g., MPEDA catch certificate for HS `030617`, Spices Board laboratory analysis for HS `090831`).

---

## 4. Consensus Golden Record Engine

When conflicting values exist across documents, the Golden Record Engine (`server/engine/goldenRecord.ts`) constructs an authoritative single source of truth using a weighted hierarchical consensus algorithm:

| Document Type               | Priority Weight | Rationale                                                |
| :-------------------------- | :-------------: | :------------------------------------------------------- |
| **Shipping Bill (SB)**      |     `0.95`      | Statutory customs declaration submitted to ICEGATE       |
| **Commercial Invoice (CI)** |     `0.90`      | Financial and contractual commercial instrument          |
| **Packing List (PL)**       |     `0.85`      | Definitive authority for physical weights, cartons, tare |
| **Bill of Lading (BL)**     |     `0.85`      | Ocean carrier manifest and title document                |
| **Purchase Order (PO)**     |     `0.70`      | Buyer commercial agreement                               |

If a conflict cannot be deterministically resolved, the field is tagged `has_conflict = true`, alerting the human documentation officer for 1-click reconciliation or manual override with full audit logging.

---

## 5. Export Readiness Score Formulation

The overall readiness score ($0 - 100\%$) is computed deterministically:

$$\text{Readiness Score} = \max\left(0, \; 100 - \sum_{i} \text{Weight}(\text{severity}_i) \right)$$

Where discrepancy severity penalties are:

- **CRITICAL** (e.g., HS code mismatch, gross weight < net weight): $-35\text{ pts}$
- **MAJOR** (e.g., quantity mismatch, expired certificate): $-20\text{ pts}$
- **WARNING** (e.g., spelling difference in consignee address, date typo): $-10\text{ pts}$
- **INFO** (e.g., minor packaging detail note): $-0\text{ pts}$

A shipment reaches **$100\%$ READINESS** only when all CRITICAL, MAJOR, and WARNING issues are resolved. Reaching $100\%$ unlocks the cryptographic verification token, downloadable Certificate, and public Verified QR code.

---

## 6. Customs Risk Simulator

The Customs Risk Engine (`server/engine/customsRisk.ts`) projects the likelihood of statutory objections before submission to customs authorities:

- **Risk Score ($0 - 100$)**: Evaluates discrepancy severity + commodity sensitivity + destination customs strictness (e.g., US FDA import alerts, EU RASFF residue testing, UAE MoIAT food safety).
- **Likelihood Classification**: Low ($< 25\%$), Moderate ($25 - 60\%$), High ($> 60\%$).
- **Pre-Drafted Customs Rebuttals**: Produces statutory justification notices quoting relevant DGFT foreign trade policies and customs regulations to expedite human response.
