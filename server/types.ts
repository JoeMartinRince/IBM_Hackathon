export type ShipmentStatus =
  | "DRAFT"
  | "PROCESSING"
  | "UNDER_REVIEW"
  | "ACTION_REQUIRED"
  | "READY"
  | "VERIFIED"
  | "ARCHIVED";

export type DiscrepancySeverity = "CRITICAL" | "MAJOR" | "MINOR" | "INFO";

export type DocumentType =
  | "Commercial Invoice"
  | "Packing List"
  | "Shipping Bill"
  | "Purchase Order"
  | "Quality Certificate"
  | "Certificate of Origin"
  | "Bill of Lading"
  | "Other";

export type DocumentStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "CLASSIFYING"
  | "EXTRACTING"
  | "VERIFIED"
  | "FAILED";

export type VerificationItemStatus = "MATCH" | "WARNING" | "MISMATCH" | "MISSING" | "UNVERIFIED";

export type UserRole =
  | "Exporter"
  | "Customs Broker"
  | "Freight Forwarder"
  | "Documentation Team"
  | "Government/Admin";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string;
  created_at: string;
}

export interface ShipmentRecord {
  id: string;
  exporter: string;
  consignee: string;
  commodity: string;
  category: "Seafood" | "Spices" | "Rubber" | "Agriculture";
  origin_port: string;
  destination_port: string;
  destination_country: string;
  container_number: string;
  seal_number: string;
  incoterm: string;
  currency: string;
  total_value: number;
  quantity: number;
  unit: string;
  net_weight: number;
  gross_weight: number;
  cbm: number;
  shipment_date: string;
  status: ShipmentStatus;
  readiness_score: number;
  risk_score: number;
  issues_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  shipment_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: DocumentType;
  confidence: number;
  status: DocumentStatus;
  version: number;
  extracted_text?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractedFieldRecord {
  id: string;
  shipment_id: string;
  document_id: string;
  field_name: string;
  raw_value: string;
  normalized_value: string;
  page_number: number;
  confidence: number;
  snippet?: string;
  created_at: string;
}

export interface GoldenRecordField {
  id: string;
  shipment_id: string;
  section: "Identity" | "Product" | "Weight" | "Commercial" | "Logistics" | "Dates";
  label: string;
  value: string;
  normalized_value: string;
  confidence: number;
  source_doc_ids: string[];
  sources_count: number;
  status: "CONFIRMED" | "CONFLICT" | "OVERRIDDEN";
  conflicting_values?: Array<{ doc_name: string; value: string }>;
  updated_at: string;
}

export interface DiscrepancyRecord {
  id: string;
  shipment_id: string;
  type: string;
  field: string;
  severity: DiscrepancySeverity;
  left_doc: string;
  left_value: string;
  right_doc: string;
  right_value: string;
  difference: string;
  expected_value: string;
  actual_values: Record<string, string>;
  explanation: string;
  suggested_action: string;
  fix_label: string;
  suggested_fix_value?: string;
  weight_impact: number;
  confidence: number;
  status: "OPEN" | "RESOLVED" | "IGNORED";
  evidence: {
    source: string;
    field: string;
    value: string;
    confidence: number;
    rule: string;
    page?: number;
    snippet?: string;
  };
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface VerificationCheckItem {
  id: string;
  category: string;
  label: string;
  status: "PASS" | "WARNING" | "FAIL" | "PENDING";
  description: string;
  details?: string;
}

export interface CustomsQueryItem {
  id: string;
  question: string;
  level: "High" | "Medium" | "Low";
  probability: number;
  reason: string;
  affected_documents: string[];
  suggested_response: string;
  issue_id?: string;
}

export interface AuditLogRecord {
  id: string;
  shipment_id: string;
  user_name: string;
  user_role: string;
  action: string;
  details: string;
  created_at: string;
}

export interface VerificationTokenRecord {
  token: string;
  shipment_id: string;
  readiness_score: number;
  status: string;
  commodity: string;
  exporter: string;
  destination: string;
  verified_at: string;
  expires_at: string;
}
