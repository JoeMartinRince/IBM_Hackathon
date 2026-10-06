# VERIFEX AI — REST API Documentation

Base URL: `http://localhost:3001/api` (or proxied via Vite at `http://localhost:8080/api`)

All requests and responses use `application/json` content-type unless otherwise noted (e.g. multipart/form-data for file uploads).

---

## 1. System Health

### `GET /api/health`
Returns the operational health and execution mode of the VERIFEX engine.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "VERIFEX AI Backend Engine",
  "timestamp": "2026-10-06T12:20:29.987Z",
  "mode": "DEMO"
}
```

---

## 2. Authentication & User Profiles

### `GET /api/auth/profiles`
Lists demo user personas available for instant testing.

**Response `200 OK`**:
```json
{
  "success": true,
  "profiles": [
    {
      "id": "usr-1",
      "name": "Alwin Joseph",
      "email": "alwin@malabarocean.in",
      "role": "Documentation Lead",
      "organization": "Malabar Ocean Foods Pvt Ltd"
    },
    {
      "id": "usr-2",
      "name": "Priya Nair",
      "email": "priya@keralaspices.org",
      "role": "Customs Broker / CHA",
      "organization": "Cochin Freight Logistics"
    },
    {
      "id": "usr-3",
      "name": "K. R. Varma",
      "email": "varma@customs.gov.in",
      "role": "Customs Appraiser",
      "organization": "Cochin Customs House (INCOK)"
    }
  ]
}
```

### `POST /api/auth/login`
Authenticates a user session or switches persona.

**Request Body**:
```json
{
  "email": "alwin@malabarocean.in",
  "role": "Documentation Lead"
}
```

---

## 3. Shipments API

### `GET /api/shipments`
Fetches all export shipments with optional search and category filters.

**Query Parameters**:
- `search` (optional): Filter by shipment ID, commodity, exporter, consignee
- `category` (optional): `Seafood`, `Spices`, `Coir`, `Rubber`, `Tea`
- `status` (optional): `READY`, `UNDER_REVIEW`, `DRAFT`, `SHIPPED`

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 6,
  "shipments": [
    {
      "id": "EXP-KL-2026-1042",
      "exporter": "Malabar Ocean Foods Pvt Ltd",
      "consignee": "Gulf Fresh Trading LLC",
      "commodity": "Frozen Shrimp",
      "category": "Seafood",
      "origin_port": "Cochin (INCOK)",
      "destination_port": "Jebel Ali, UAE (AEJEA)",
      "destination_country": "UAE",
      "container_number": "CSQU3054383",
      "invoice_value": 78600,
      "currency": "USD",
      "readiness_score": 68,
      "status": "UNDER_REVIEW",
      "issues_count": 3,
      "created_at": "2026-10-06T08:30:00Z"
    }
  ]
}
```

### `GET /api/shipments/:id`
Retrieves detailed information for a specific shipment.

### `POST /api/shipments`
Registers a new export shipment draft.

**Request Body**:
```json
{
  "exporter": "Wayanad Organic Spices Ltd",
  "consignee": "Rotterdam Spice Merchants BV",
  "commodity": "Alleppey Green Cardamom",
  "category": "Spices",
  "origin_port": "Cochin (INCOK)",
  "destination_port": "Rotterdam, Netherlands",
  "destination_country": "Netherlands",
  "invoice_value": 45000,
  "currency": "EUR"
}
```

---

## 4. Document Management & Ingestion

### `GET /api/shipments/:id/documents`
Lists all uploaded trade documents associated with the shipment.

### `POST /api/shipments/:id/documents`
Uploads one or more shipping files (`multipart/form-data`).

**Form Data Fields**:
- `files`: File[] (supports PDF, XLSX, DOCX, PNG, JPG)

**Response `201 Created`**:
```json
{
  "success": true,
  "uploaded": 3,
  "documents": [
    {
      "id": "doc-uuid-1",
      "shipment_id": "EXP-KL-2026-1042",
      "file_name": "Commercial_Invoice_1042.pdf",
      "doc_type": "COMMERCIAL_INVOICE",
      "status": "PARSED"
    }
  ]
}
```

### `POST /api/documents/:id/process`
Triggers classification, OCR extraction, and field normalization on a document.

---

## 5. Verification & Discrepancies

### `GET /api/shipments/:id/results`
Returns comprehensive verification results:
- Readiness score ($0-100\%$)
- Customs risk index
- Discrepancy list with severities and affected documents
- Side-by-side comparison matrix across documents
- 10-point compliance checklist

### `GET /api/shipments/:id/golden-record`
Returns the consensus Golden Record dataset.

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 17,
  "golden_record": [
    {
      "id": "gr-1",
      "field_name": "commodity",
      "field_label": "Commodity Description",
      "consensus_value": "Frozen Shrimp 21/25 Raw Headless",
      "confidence_score": 0.98,
      "source_document": "Commercial Invoice",
      "category": "product",
      "has_conflict": false
    }
  ]
}
```

### `PATCH /api/shipments/:id/golden-record/:fieldId`
Overrides or resolves a contested Golden Record field with audit log.

**Request Body**:
```json
{
  "value": "1,200 Cartons",
  "updated_by": "Alwin Joseph"
}
```

### `POST /api/discrepancies/:id/resolve`
Applies an automated 1-click resolution to a detected discrepancy.

**Request Body**:
```json
{
  "resolved_by": "Alwin Joseph"
}
```

### `POST /api/shipments/:id/reverify`
Re-runs the deterministic verification engine after edits or document re-uploads.

---

## 6. Customs Risk & Reports

### `POST /api/shipments/:id/customs-risk`
Calculates projected customs queries and statutory rebuttal drafts.

### `POST /api/shipments/:id/report`
Generates a structured Verification Certificate containing:
- Certificate ID & Timestamp
- Shipment Golden Record snapshot
- Discrepancy resolution history
- Cryptographic verification signature

### `POST /api/shipments/:id/qr`
Generates a public verification token and QR verification payload.

---

## 7. Natural Language Assistant

### `POST /api/shipments/:id/assistant`
Grounds an export trade query against the shipment's verified documents.

**Request Body**:
```json
{
  "question": "What is the net weight and container number for this shipment?"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "answer": "For shipment EXP-KL-2026-1042: The verified Net Weight is 12,000.00 KG (Gross Weight: 13,450.00 KG) across 1,200 cartons. The assigned refrigerated container is CSQU3054383 (ISO 6346 checksum verified) under seal ML-09281.",
  "citations": [
    "Commercial Invoice (CI-2026-881)",
    "Packing List (PL-2026-881)",
    "Shipping Bill (SB-9920141)"
  ]
}
```

---

## 8. Public Verification Portal

### `GET /api/verify-status/:token`
Public verification endpoint scanned by foreign customs, freight forwarders, or port gate officers.

**Response `200 OK`**:
```json
{
  "success": true,
  "verified": true,
  "shipment_id": "EXP-KL-2026-1042",
  "readiness_score": 100,
  "timestamp": "2026-10-06T12:00:00Z",
  "exporter": "Malabar Ocean Foods Pvt Ltd",
  "port_of_loading": "Cochin Sea (INCOK)",
  "destination_port": "Jebel Ali, UAE (AEJEA)",
  "seal_number": "ML-09281",
  "container_number": "CSQU3054383"
}
```
