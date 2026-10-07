-- VERIFAI - PostgreSQL Database Schema
-- IBM x Government of Kerala - KeralAI Hackathon 2026
-- Challenge 3: Export Document Verification System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization VARCHAR(255) NOT NULL DEFAULT 'Kerala Export Consortium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. EXP-KL-2026-1042, VFX-2026-001
    exporter VARCHAR(255) NOT NULL,
    consignee VARCHAR(255) NOT NULL,
    commodity VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Seafood', 'Spices', 'Rubber', 'Agriculture')),
    origin_port VARCHAR(100) NOT NULL,
    destination_port VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    container_number VARCHAR(50),
    seal_number VARCHAR(50),
    incoterm VARCHAR(20) DEFAULT 'CIF',
    currency VARCHAR(10) DEFAULT 'USD',
    total_value NUMERIC(15, 2) DEFAULT 0.00,
    quantity NUMERIC(15, 2) DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'cartons',
    net_weight NUMERIC(15, 2) DEFAULT 0.00,
    gross_weight NUMERIC(15, 2) DEFAULT 0.00,
    cbm NUMERIC(10, 2) DEFAULT 0.00,
    shipment_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PROCESSING', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'READY', 'VERIFIED', 'ARCHIVED')),
    readiness_score INT DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
    risk_score INT DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    issues_count INT DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Document Slots (Multi-User Role-Based Ingestion)
CREATE TABLE IF NOT EXISTS document_slots (
    id VARCHAR(100) PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    required BOOLEAN DEFAULT TRUE,
    assigned_user_id VARCHAR(100) NOT NULL,
    assigned_user_name VARCHAR(255) NOT NULL,
    assigned_user_role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'READY', 'CORRECTION_REQUESTED', 'CORRECTION_SUBMITTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Document Versions (Version Control & Re-verification Tracking)
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id VARCHAR(100) NOT NULL REFERENCES document_slots(id) ON DELETE CASCADE,
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    filename VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) NOT NULL DEFAULT '250 KB',
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_by_role VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Correction Requests (Admin Gated Discrepancy Reconciliation)
CREATE TABLE IF NOT EXISTS correction_requests (
    id VARCHAR(100) PRIMARY KEY,
    slot_id VARCHAR(100) NOT NULL REFERENCES document_slots(id) ON DELETE CASCADE,
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    discrepancy_title VARCHAR(255) DEFAULT 'Reconciliation Request',
    reason TEXT NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED')),
    submitted_version INT,
    submitted_at TIMESTAMPTZ
);

-- 6. Documents (Raw Upload & File Metadata)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(100) NOT NULL DEFAULT 'Other',
    confidence INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADING', 'UPLOADED', 'CLASSIFYING', 'EXTRACTING', 'VERIFIED', 'FAILED')),
    version INT DEFAULT 1,
    extracted_text TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Extracted Fields (Cross-Document Verification Attributes)
CREATE TABLE IF NOT EXISTS extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    raw_value TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    page_number INT DEFAULT 1,
    confidence INT DEFAULT 95,
    snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Golden Records (Synthesized Source of Truth)
CREATE TABLE IF NOT EXISTS golden_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    confidence INT DEFAULT 95,
    sources_count INT DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CONFLICT', 'OVERRIDDEN')),
    conflicting_values JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Discrepancies
CREATE TABLE IF NOT EXISTS discrepancies (
    id VARCHAR(100) PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    field VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR', 'INFO')),
    left_doc VARCHAR(100) NOT NULL,
    left_value TEXT NOT NULL,
    right_doc VARCHAR(100) NOT NULL,
    right_value TEXT NOT NULL,
    difference TEXT NOT NULL,
    expected_value TEXT NOT NULL,
    actual_values JSONB DEFAULT '{}'::jsonb,
    explanation TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    fix_label TEXT NOT NULL,
    suggested_fix_value TEXT,
    weight_impact INT DEFAULT 5,
    confidence INT DEFAULT 90,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'IGNORED')),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Verification Tokens (for Verified Public QR Scan)
CREATE TABLE IF NOT EXISTS verification_tokens (
    token VARCHAR(100) PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    readiness_score INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    commodity VARCHAR(255) NOT NULL,
    exporter VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_shipments_category ON shipments(category);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_document_slots_shipment_id ON document_slots(shipment_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_slot_id ON document_versions(slot_id);
CREATE INDEX IF NOT EXISTS idx_documents_shipment_id ON documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_shipment_id ON extracted_fields(shipment_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_shipment_id ON discrepancies(shipment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_shipment_id ON audit_logs(shipment_id);
