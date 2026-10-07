# VERIFAI — Database Architecture & Schema

**Platform**: VERIFAI (AI-Powered Export Document Verification & Readiness Platform)  
**Hackathon**: IBM x Government of Kerala — KeralAI Hackathon 2026

---

## 1. Relational Database Design

The data architecture is designed for transactional consistency, document versioning, and auditable trade compliance. The full DDL script is maintained in `server/schema.sql`.

```
                  +---------------------------+
                  |         shipments         |
                  +---------------------------+
                  | PK  id                    |
                  |     exporter              |
                  |     consignee             |
                  |     commodity             |
                  |     category              |
                  |     origin_port           |
                  |     destination_port      |
                  |     container_number      |
                  |     invoice_value         |
                  |     currency              |
                  |     readiness_score       |
                  |     status                |
                  +-------------+-------------+
                                | 1
                                |
             +------------------+------------------+------------------+
             | 1:N                                 | 1:N              | 1:N
+------------v------------+      +-----------------v----+      +------v--------------------+
|        documents        |      |    discrepancies     |      |   golden_record_entries   |
+-------------------------+      +----------------------+      +---------------------------+
| PK  id                  |      | PK  id               |      | PK  id                    |
| FK  shipment_id         |      | FK  shipment_id      |      | FK  shipment_id           |
|     file_name           |      |     field_name       |      |     field_name            |
|     doc_type            |      |     severity         |      |     field_label           |
|     status              |      |     expected_value   |      |     consensus_value       |
|     extracted_text      |      |     actual_value     |      |     confidence_score      |
|     file_path           |      |     description      |      |     source_document       |
+------------+------------+      |     status           |      |     category              |
             | 1                 |     resolved_by      |      |     has_conflict          |
             |                   |     resolved_at      |      +---------------------------+
             | 1:N               +----------------------+
+------------v------------+                                           | 1
|     extracted_fields    |                                           | 1:N
+-------------------------+                                    +------v--------------------+
| PK  id                  |                                    |        audit_logs         |
| FK  document_id         |                                    +---------------------------+
|     field_name          |                                    | PK  id                    |
|     field_value         |                                    | FK  shipment_id           |
|     confidence_score    |                                    |     user_name             |
|     page_number         |                                    |     user_role             |
|     bounding_box        |                                    |     action                |
+-------------------------+                                    |     details               |
                                                               |     created_at            |
                                                               +---------------------------+
```

---

## 2. Table Specifications

### 2.1 `shipments`

Stores the master export shipment header and status.

- `id` (VARCHAR 64, PK): Unique shipment reference (e.g., `EXP-KL-2026-1042`).
- `exporter` (VARCHAR 255): Legal trade name of the Kerala exporter.
- `consignee` (VARCHAR 255): Overseas buyer entity.
- `commodity` (VARCHAR 255): Cargo description.
- `category` (VARCHAR 50): Key Kerala export segment (`Seafood`, `Spices`, `Coir`, `Rubber`, `Tea`).
- `origin_port` (VARCHAR 100): Loading port (`Cochin (INCOK)` or `Vizhinjam (INVIZ)`).
- `destination_port` (VARCHAR 100): Port of discharge (e.g., `Jebel Ali, UAE (AEJEA)`).
- `container_number` (VARCHAR 32): ISO 6346 container identifier.
- `invoice_value` (NUMERIC 14,2): Total commercial value.
- `currency` (VARCHAR 3): ISO 4217 currency code (`USD`, `EUR`, `GBP`, `AED`, `INR`).
- `readiness_score` (INT): Calculated readiness percentage ($0 - 100$).
- `status` (VARCHAR 32): Lifecycle stage (`DRAFT`, `UNDER_REVIEW`, `READY`, `SHIPPED`).

### 2.2 `documents`

Stores metadata and parsed contents for uploaded trade documents.

- `id` (VARCHAR 64, PK): Document UUID.
- `shipment_id` (VARCHAR 64, FK -> shipments.id): Owning shipment.
- `file_name` (VARCHAR 255): Original filename.
- `doc_type` (VARCHAR 64): Classified document type (`COMMERCIAL_INVOICE`, `PACKING_LIST`, etc.).
- `status` (VARCHAR 32): Ingestion status (`UPLOADED`, `PARSED`, `VERIFIED`, `REJECTED`).
- `extracted_text` (TEXT): Full parsed textual stream.
- `file_path` (VARCHAR 512): Disk location in `uploads/`.

### 2.3 `extracted_fields`

Granular structured key-value pairs parsed from individual trade documents.

- `id` (VARCHAR 64, PK): Field extraction ID.
- `document_id` (VARCHAR 64, FK -> documents.id): Source document.
- `field_name` (VARCHAR 64): Normalized semantic key (e.g., `total_weight_kg`, `hs_code`).
- `field_value` (TEXT): Extracted value.
- `confidence_score` (NUMERIC 4,3): Extraction confidence ($0.000 - 1.000$).
- `page_number` (INT): Page on which the value appeared.
- `bounding_box` (JSONB): Visual coordinates on the document surface.

### 2.4 `discrepancies`

Tracks cross-document conflicts detected by the verification engine.

- `id` (VARCHAR 64, PK): Discrepancy UUID.
- `shipment_id` (VARCHAR 64, FK -> shipments.id).
- `field_name` (VARCHAR 64): Target trade attribute.
- `severity` (VARCHAR 20): `CRITICAL`, `MAJOR`, `WARNING`, or `INFO`.
- `expected_value` (TEXT): Authoritative baseline value.
- `actual_value` (TEXT): Conflicting value found.
- `affected_documents` (JSONB): Array of document names in conflict.
- `status` (VARCHAR 20): `OPEN`, `RESOLVED`, `IGNORED`.
- `resolved_by` (VARCHAR 100): User who confirmed 1-click resolution.

### 2.5 `golden_record_entries`

Consensus single source of truth across all submitted documents.

- `id` (VARCHAR 64, PK).
- `shipment_id` (VARCHAR 64, FK -> shipments.id).
- `field_name` (VARCHAR 64): Normalized attribute key.
- `field_label` (VARCHAR 100): Display label for UI.
- `consensus_value` (TEXT): Authoritative consensus value.
- `confidence_score` (NUMERIC 4,3): Statistical or heuristic consensus confidence.
- `source_document` (VARCHAR 100): Primary document establishing the value.
- `category` (VARCHAR 32): Field grouping (`general`, `parties`, `product`, `logistics`, `financial`).
- `has_conflict` (BOOLEAN): Flag indicating unresolved discrepancy.

### 2.6 `audit_logs`

Immutable compliance audit log for customs traceability.

- `id` (VARCHAR 64, PK).
- `shipment_id` (VARCHAR 64, FK -> shipments.id).
- `user_name` (VARCHAR 100): Acting officer name.
- `user_role` (VARCHAR 100): Role (e.g., `Documentation Lead`, `CHA Broker`).
- `action` (VARCHAR 100): Action executed.
- `details` (TEXT): Detailed description of modification or resolution.
- `created_at` (TIMESTAMP WITH TIME ZONE).

---

## 3. Dual-Mode Storage Architecture

VERIFAI incorporates a dual-mode persistence pattern:

1. **Production / Live Mode (PostgreSQL)**:
   - When `DATABASE_URL` is configured in `.env`, the system establishes a connection pool with PostgreSQL.
   - Tables are created or verified against `server/schema.sql`.

2. **Resilient Demo Mode (In-Memory Pre-Seeded Store)**:
   - When running offline or without database infrastructure, the backend transparently initializes an in-memory repository (`server/db.ts`).
   - Pre-seeded with 6 realistic Kerala maritime shipments:
     - `EXP-KL-2026-1042`: Malabar Ocean Foods Pvt Ltd (Frozen Shrimp to Jebel Ali, UAE via Cochin INCOK)
     - `EXP-KL-2026-1041`: Wayanad Organic Spices Ltd (Cardamom to Rotterdam via Vizhinjam INVIZ)
     - `EXP-KL-2026-1039`: Alappuzha Coir Exports LLP (Geotextiles to Hamburg via Cochin INCOK)
     - `EXP-KL-2026-1037`: Kottayam Rubber Producers (Sheet Rubber to Yokohama via Cochin INCOK)
     - `EXP-KL-2026-1035`: High Ranges Tea Estate (Orthodox Black Tea to Felixstowe via Cochin INCOK)
     - `EXP-KL-2026-1031`: Calicut Marine Processors (Calamari to Busan via Cochin INCOK)
   - Guarantees 100% reliable evaluation with zero external database dependencies.
