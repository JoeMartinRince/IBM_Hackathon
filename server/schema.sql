-- VERIFEX AI - PostgreSQL Database Schema
-- IBM x Government of Kerala - KeralAI Hackathon 2026
-- Challenge 3: Export Document Verification System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Exporter', 'Customs Broker', 'Freight Forwarder', 'Documentation Team', 'Government/Admin')),
    organization VARCHAR(255) NOT NULL DEFAULT 'Kerala Export Consortium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. EXP-KL-2026-1042
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

-- 3. Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 4. Extracted Fields
CREATE TABLE IF NOT EXISTS extracted_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 5. Golden Records
CREATE TABLE IF NOT EXISTS golden_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. Discrepancies
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

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Verification Tokens (for Verified Public QR Scan)
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
CREATE INDEX IF NOT EXISTS idx_documents_shipment_id ON documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_shipment_id ON extracted_fields(shipment_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_shipment_id ON discrepancies(shipment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_shipment_id ON audit_logs(shipment_id);
