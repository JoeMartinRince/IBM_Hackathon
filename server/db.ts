import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
import {
  ShipmentRecord,
  DocumentRecord,
  ExtractedFieldRecord,
  GoldenRecordField,
  DiscrepancyRecord,
  AuditLogRecord,
  VerificationTokenRecord,
  UserProfile,
  DocumentSlotRecord,
  DocumentVersionRecord,
  CorrectionRequestRecord,
  AppRole,
} from "./types";

// In-Memory & File-backed Store for DEMO MODE / Instant Offline Execution with Live PostgreSQL Persistence
export class DataStore {
  public profiles: Map<string, UserProfile> = new Map();
  public shipments: Map<string, ShipmentRecord> = new Map();
  public documents: Map<string, DocumentRecord> = new Map();
  public documentSlots: Map<string, DocumentSlotRecord[]> = new Map();
  public extractedFields: Map<string, ExtractedFieldRecord> = new Map();
  public goldenRecords: Map<string, GoldenRecordField[]> = new Map();
  public discrepancies: Map<string, DiscrepancyRecord> = new Map();
  public auditLogs: AuditLogRecord[] = [];
  public verificationTokens: Map<string, VerificationTokenRecord> = new Map();
  public pool: Pool | null = null;
  public isPostgresConnected: boolean = false;

  constructor() {
    this.seedInitialData();
    if (process.env.DATABASE_URL) {
      try {
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        });
      } catch (e) {
        console.warn("[PostgreSQL] Failed to initialize connection pool:", e);
      }
    }
  }

  private seedInitialData() {
    // Default Profile
    const defaultProfile: UserProfile = {
      id: "u-alwin-01",
      email: "alwinjosegeorge2028@cs.sjcetpalai.ac.in",
      name: "Alwin Joseph",
      role: "Documentation Team",
      organization: "Malabar Marine Products Consortium, Cochin",
      created_at: new Date().toISOString(),
    };
    this.profiles.set(defaultProfile.id, defaultProfile);

    // Initial Realistic Kerala Shipments
    const seedShipments: ShipmentRecord[] = [
      {
        id: "EXP-ABC-2026-001",
        exporter: "ABC Seafood",
        consignee: "Gulf Fresh Trading LLC, Dubai",
        commodity: "Frozen Shrimp",
        category: "Seafood",
        origin_port: "Cochin Port (INCOK)",
        destination_port: "Dubai",
        destination_country: "UAE",
        container_number: "MSKU 482915-3",
        seal_number: "ML-2209184",
        incoterm: "CIF Dubai",
        currency: "USD",
        total_value: 128000,
        quantity: 1200,
        unit: "cartons",
        net_weight: 12000,
        gross_weight: 13450,
        cbm: 58.2,
        shipment_date: "2026-10-16",
        status: "UNDER_REVIEW",
        readiness_score: 60,
        risk_score: 36,
        issues_count: 2,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "VFX-2026-001",
        exporter: "Malabar Ocean Foods Pvt Ltd",
        consignee: "Gulf Fresh Trading LLC",
        commodity: "Frozen Seafood Export",
        category: "Seafood",
        origin_port: "Cochin Port (INCOK)",
        destination_port: "Jebel Ali, Dubai (AEJEA)",
        destination_country: "UAE",
        container_number: "MSKU 482915-3",
        seal_number: "ML-2209184",
        incoterm: "CIF Jebel Ali",
        currency: "USD",
        total_value: 186400,
        quantity: 1200,
        unit: "cartons",
        net_weight: 12000,
        gross_weight: 13450,
        cbm: 58.2,
        shipment_date: "2026-10-16",
        status: "UNDER_REVIEW",
        readiness_score: 84,
        risk_score: 36,
        issues_count: 3,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "EXP-KL-2026-1042",
        exporter: "Malabar Ocean Foods Pvt Ltd",
        consignee: "Gulf Fresh Trading LLC",
        commodity: "Frozen Shrimp",
        category: "Seafood",
        origin_port: "Cochin (INCOK)",
        destination_port: "Jebel Ali, UAE (AEJEA)",
        destination_country: "UAE",
        container_number: "MSKU 482915-3",
        seal_number: "ML-2209184",
        incoterm: "CIF Jebel Ali",
        currency: "USD",
        total_value: 186400,
        quantity: 1200,
        unit: "cartons",
        net_weight: 12000,
        gross_weight: 13450,
        cbm: 58.2,
        shipment_date: "2026-10-16",
        status: "UNDER_REVIEW",
        readiness_score: 84,
        risk_score: 36,
        issues_count: 3,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "EXP-KL-2026-1041",
        exporter: "Wayanad Spice Collective",
        consignee: "Nordgewürz GmbH",
        commodity: "Black Pepper",
        category: "Spices",
        origin_port: "Cochin (INCOK)",
        destination_port: "Hamburg, Germany",
        destination_country: "Germany",
        container_number: "HLCU 918234-1",
        seal_number: "HL-4481023",
        incoterm: "FOB Cochin",
        currency: "EUR",
        total_value: 92750,
        quantity: 450,
        unit: "bags",
        net_weight: 22500,
        gross_weight: 22800,
        cbm: 42.0,
        shipment_date: "2026-10-18",
        status: "READY",
        readiness_score: 100,
        risk_score: 8,
        issues_count: 0,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "EXP-KL-2026-1039",
        exporter: "Kottayam Latex Industries",
        consignee: "Straits Polymer Pte Ltd",
        commodity: "Natural Rubber (ISNR-20)",
        category: "Rubber",
        origin_port: "Kochi (INCOK)",
        destination_port: "Singapore (SGSIN)",
        destination_country: "Singapore",
        container_number: "CMAU 582190-7",
        seal_number: "CM-9912041",
        incoterm: "CIF Singapore",
        currency: "USD",
        total_value: 241000,
        quantity: 800,
        unit: "bales",
        net_weight: 40000,
        gross_weight: 40800,
        cbm: 68.0,
        shipment_date: "2026-10-14",
        status: "ACTION_REQUIRED",
        readiness_score: 61,
        risk_score: 68,
        issues_count: 6,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "EXP-KL-2026-1037",
        exporter: "Idukki Green Pods Ltd",
        consignee: "Al Noor Foodstuff Co.",
        commodity: "Cardamom (Extra Bold 8mm)",
        category: "Spices",
        origin_port: "Cochin (INCOK)",
        destination_port: "Dubai, UAE",
        destination_country: "UAE",
        container_number: "MSKU 331908-4",
        seal_number: "ML-8109281",
        incoterm: "CIF Dubai",
        currency: "USD",
        total_value: 64300,
        quantity: 200,
        unit: "cartons",
        net_weight: 5000,
        gross_weight: 5350,
        cbm: 16.5,
        shipment_date: "2026-10-20",
        status: "UNDER_REVIEW",
        readiness_score: 92,
        risk_score: 22,
        issues_count: 1,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "EXP-KL-2026-1035",
        exporter: "Kovalam Marine Exports",
        consignee: "Emirates Catch FZE",
        commodity: "Fresh Seafood (Chilled Tuna)",
        category: "Seafood",
        origin_port: "Vizhinjam (INVIZ)",
        destination_port: "Abu Dhabi, UAE",
        destination_country: "UAE",
        container_number: "AIR-CGO-774",
        seal_number: "SEAL-88910",
        incoterm: "FOB Vizhinjam",
        currency: "USD",
        total_value: 58900,
        quantity: 320,
        unit: "crates",
        net_weight: 6400,
        gross_weight: 7100,
        cbm: 18.0,
        shipment_date: "2026-10-08",
        status: "READY",
        readiness_score: 100,
        risk_score: 5,
        issues_count: 0,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "EXP-KL-2026-1031",
        exporter: "Vembanad Coir Works",
        consignee: "Holland Natural BV",
        commodity: "Coir Geotextiles",
        category: "Agriculture",
        origin_port: "Cochin (INCOK)",
        destination_port: "Rotterdam, Netherlands",
        destination_country: "EU",
        container_number: "MSKU 110948-2",
        seal_number: "ML-3391029",
        incoterm: "FOB Cochin",
        currency: "EUR",
        total_value: 31200,
        quantity: 150,
        unit: "rolls",
        net_weight: 15000,
        gross_weight: 15400,
        cbm: 38.0,
        shipment_date: "2026-09-24",
        status: "ARCHIVED",
        readiness_score: 100,
        risk_score: 4,
        issues_count: 0,
        created_by: defaultProfile.id,
        created_at: new Date(Date.now() - 1209600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    for (const s of seedShipments) {
      this.shipments.set(s.id, s);
    }

    // Seed Documents for Primary Demo Shipment EXP-KL-2026-1042
    const seedDocs: DocumentRecord[] = [
      {
        id: "doc-ci-01",
        shipment_id: "EXP-KL-2026-1042",
        filename: "commercial_invoice_CI-9042.pdf",
        file_path: "/uploads/commercial_invoice_CI-9042.pdf",
        file_size: 248000,
        mime_type: "application/pdf",
        document_type: "Commercial Invoice",
        confidence: 97,
        status: "VERIFIED",
        version: 1,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "doc-pl-02",
        shipment_id: "EXP-KL-2026-1042",
        filename: "packing_list_PL-9042.pdf",
        file_path: "/uploads/packing_list_PL-9042.pdf",
        file_size: 186000,
        mime_type: "application/pdf",
        document_type: "Packing List",
        confidence: 94,
        status: "VERIFIED",
        version: 1,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "doc-sb-03",
        shipment_id: "EXP-KL-2026-1042",
        filename: "shipping_bill_SB447192.pdf",
        file_path: "/uploads/shipping_bill_SB447192.pdf",
        file_size: 312000,
        mime_type: "application/pdf",
        document_type: "Shipping Bill",
        confidence: 96,
        status: "VERIFIED",
        version: 1,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "doc-po-04",
        shipment_id: "EXP-KL-2026-1042",
        filename: "purchase_order_PO-GFT-2291.xlsx",
        file_path: "/uploads/purchase_order_PO-GFT-2291.xlsx",
        file_size: 64000,
        mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        document_type: "Purchase Order",
        confidence: 92,
        status: "VERIFIED",
        version: 1,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "doc-qc-05",
        shipment_id: "EXP-KL-2026-1042",
        filename: "quality_certificate_MPEDA.jpg",
        file_path: "/uploads/quality_certificate_MPEDA.jpg",
        file_size: 1240000,
        mime_type: "image/jpeg",
        document_type: "Quality Certificate",
        confidence: 89,
        status: "VERIFIED",
        version: 1,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    for (const d of seedDocs) {
      this.documents.set(d.id, d);
    }

    // Seed Discrepancies for Primary Demo Shipment
    const seedDiscrepancies: DiscrepancyRecord[] = [
      {
        id: "qty",
        shipment_id: "EXP-KL-2026-1042",
        type: "Quantity mismatch",
        field: "Quantity",
        severity: "CRITICAL",
        left_doc: "Invoice",
        left_value: "1,200 cartons",
        right_doc: "Packing List",
        right_value: "1,180 cartons",
        difference: "20 cartons",
        expected_value: "1,200 cartons",
        actual_values: {
          "Commercial Invoice": "1,200 cartons",
          "Packing List": "1,180 cartons",
          "Shipping Bill": "1,200 cartons",
          "Purchase Order": "1,200 cartons",
        },
        explanation:
          "The packing list specifies 1,180 cartons while the commercial invoice and shipping bill declare 1,200 cartons. A 20-carton shortfall at port gate will cause customs detention and verification hold.",
        suggested_action: "Verify physical loading tally and align Packing List to 1,200 cartons.",
        fix_label: "Update Packing List quantity to 1,200 cartons",
        suggested_fix_value: "1,200 cartons",
        weight_impact: 12,
        confidence: 96,
        status: "OPEN",
        evidence: {
          source: "Packing List — Page 1",
          field: "Total Cartons",
          value: "1,180 cartons",
          confidence: 96,
          rule: "Cross-document quantity consistency (CI vs PL)",
          page: 1,
          snippet: "TOTAL PACKAGES: 1,180 MASTER CARTONS | NET WEIGHT: 11,800 KGS",
        },
        created_at: new Date().toISOString(),
      },
      {
        id: "hs",
        shipment_id: "EXP-KL-2026-1042",
        type: "HS Code mismatch",
        field: "HS Code",
        severity: "MAJOR",
        left_doc: "Invoice",
        left_value: "030617",
        right_doc: "Shipping Bill",
        right_value: "030616",
        difference: "Tariff line 6th digit (030617 ≠ 030616)",
        expected_value: "030617",
        actual_values: {
          "Commercial Invoice": "030617",
          "Shipping Bill": "030616",
          "Purchase Order": "030617",
        },
        explanation:
          "The Shipping Bill specifies HS 030616 (cold-water shrimp / Pandalidae), whereas the commercial invoice and export goods are warm-water Vannamei shrimp classified under HS 030617. Customs will flag for misdeclaration of export incentive duty drawback.",
        suggested_action: "Amend Shipping Bill declaration to tariff line 030617.",
        fix_label: "Align Shipping Bill HS Code to 030617",
        suggested_fix_value: "030617",
        weight_impact: 3,
        confidence: 98,
        status: "OPEN",
        evidence: {
          source: "Shipping Bill — Page 2",
          field: "RITC / HS Code",
          value: "030616",
          confidence: 98,
          rule: "Tariff classification consistency (CI vs SB)",
          page: 2,
          snippet: "ITEM 1: FROZEN SHRIMP | RITC: 03061600 | DBK SCHEME: 0306B",
        },
        created_at: new Date().toISOString(),
      },
      {
        id: "cert",
        shipment_id: "EXP-KL-2026-1042",
        type: "Quality Certificate expiring",
        field: "Certificate Validity",
        severity: "MINOR",
        left_doc: "Valid Until",
        left_value: "18 Oct 2026",
        right_doc: "Shipment Date",
        right_value: "16 Oct 2026",
        difference: "2 days validity margin",
        expected_value: "Validity window ≥ 14 days",
        actual_values: {
          "Quality Certificate": "Valid until 18 Oct 2026",
          "Planned ETD": "16 Oct 2026",
        },
        explanation:
          "The MPEDA Health Certificate expires on 18 Oct 2026, giving only a 48-hour buffer over planned vessel ETD. Sea transit to Jebel Ali is 4 days, meaning the certificate will lapse prior to destination customs clearance.",
        suggested_action: "Upload MPEDA certificate re-validation endorsement.",
        fix_label: "Attach renewed certificate (valid until 18 Jan 2027)",
        suggested_fix_value: "Valid until 18 Jan 2027",
        weight_impact: 1,
        confidence: 91,
        status: "OPEN",
        evidence: {
          source: "Quality Certificate — Page 1",
          field: "Date of Expiry",
          value: "18-OCT-2026",
          confidence: 91,
          rule: "Certificate validity window ≥ 14 days over ETA",
          page: 1,
          snippet: "EIC / MPEDA REGISTRATION NO: KL-04/182 | VALIDITY: 18/10/2026",
        },
        created_at: new Date().toISOString(),
      },
    ];

    for (const disc of seedDiscrepancies) {
      this.discrepancies.set(disc.id, disc);
    }

    // Seed Golden Record for Primary Demo Shipment
    const seedGolden: GoldenRecordField[] = [
      {
        id: "g1",
        shipment_id: "EXP-KL-2026-1042",
        section: "Identity",
        label: "Exporter",
        value: "Malabar Ocean Foods Pvt Ltd",
        normalized_value: "MALABAR OCEAN FOODS PVT LTD",
        confidence: 99,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03", "doc-po-04"],
        sources_count: 4,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g2",
        shipment_id: "EXP-KL-2026-1042",
        section: "Identity",
        label: "Consignee",
        value: "Gulf Fresh Trading LLC",
        normalized_value: "GULF FRESH TRADING LLC",
        confidence: 98,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03", "doc-po-04"],
        sources_count: 4,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g3",
        shipment_id: "EXP-KL-2026-1042",
        section: "Identity",
        label: "Destination",
        value: "Jebel Ali, UAE",
        normalized_value: "JEBEL ALI, UAE",
        confidence: 97,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03"],
        sources_count: 3,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g4",
        shipment_id: "EXP-KL-2026-1042",
        section: "Product",
        label: "Description",
        value: "Frozen Shrimp (Litopenaeus vannamei) 21/25 count",
        normalized_value: "FROZEN SHRIMP 21/25",
        confidence: 95,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03", "doc-po-04"],
        sources_count: 4,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g5",
        shipment_id: "EXP-KL-2026-1042",
        section: "Product",
        label: "HS Code",
        value: "030617",
        normalized_value: "030617",
        confidence: 93,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-po-04"],
        sources_count: 3,
        status: "CONFLICT",
        conflicting_values: [{ doc_name: "Shipping Bill", value: "030616" }],
        updated_at: new Date().toISOString(),
      },
      {
        id: "g6",
        shipment_id: "EXP-KL-2026-1042",
        section: "Product",
        label: "Quantity",
        value: "1,200 cartons",
        normalized_value: "1200",
        confidence: 96,
        source_doc_ids: ["doc-ci-01", "doc-sb-03", "doc-po-04"],
        sources_count: 3,
        status: "CONFLICT",
        conflicting_values: [{ doc_name: "Packing List", value: "1,180 cartons" }],
        updated_at: new Date().toISOString(),
      },
      {
        id: "g7",
        shipment_id: "EXP-KL-2026-1042",
        section: "Weight",
        label: "Net Weight",
        value: "12,000 KG",
        normalized_value: "12000",
        confidence: 98,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03", "doc-po-04"],
        sources_count: 4,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g8",
        shipment_id: "EXP-KL-2026-1042",
        section: "Weight",
        label: "Gross Weight",
        value: "13,450 KG",
        normalized_value: "13450",
        confidence: 97,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03"],
        sources_count: 3,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g9",
        shipment_id: "EXP-KL-2026-1042",
        section: "Weight",
        label: "CBM",
        value: "58.2 m³",
        normalized_value: "58.2",
        confidence: 94,
        source_doc_ids: ["doc-pl-02", "doc-sb-03"],
        sources_count: 2,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g10",
        shipment_id: "EXP-KL-2026-1042",
        section: "Commercial",
        label: "Unit Price",
        value: "USD 155.33 / carton",
        normalized_value: "155.33",
        confidence: 97,
        source_doc_ids: ["doc-ci-01", "doc-po-04"],
        sources_count: 2,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g11",
        shipment_id: "EXP-KL-2026-1042",
        section: "Commercial",
        label: "Total Value",
        value: "USD 186,400",
        normalized_value: "186400",
        confidence: 99,
        source_doc_ids: ["doc-ci-01", "doc-sb-03", "doc-po-04"],
        sources_count: 3,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g12",
        shipment_id: "EXP-KL-2026-1042",
        section: "Commercial",
        label: "Currency",
        value: "USD",
        normalized_value: "USD",
        confidence: 99,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03", "doc-po-04"],
        sources_count: 4,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g13",
        shipment_id: "EXP-KL-2026-1042",
        section: "Commercial",
        label: "Incoterm",
        value: "CIF Jebel Ali",
        normalized_value: "CIF",
        confidence: 96,
        source_doc_ids: ["doc-ci-01", "doc-sb-03", "doc-po-04"],
        sources_count: 3,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g14",
        shipment_id: "EXP-KL-2026-1042",
        section: "Logistics",
        label: "Port of Loading",
        value: "Cochin (INCOK)",
        normalized_value: "INCOK",
        confidence: 98,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03"],
        sources_count: 3,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g15",
        shipment_id: "EXP-KL-2026-1042",
        section: "Logistics",
        label: "Container",
        value: "MSKU 482915-3",
        normalized_value: "MSKU4829153",
        confidence: 97,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03"],
        sources_count: 3,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g16",
        shipment_id: "EXP-KL-2026-1042",
        section: "Logistics",
        label: "Seal",
        value: "ML-2209184",
        normalized_value: "ML2209184",
        confidence: 92,
        source_doc_ids: ["doc-pl-02", "doc-sb-03"],
        sources_count: 2,
        status: "CONFIRMED",
        updated_at: new Date().toISOString(),
      },
      {
        id: "g17",
        shipment_id: "EXP-KL-2026-1042",
        section: "Dates",
        label: "Shipment Date",
        value: "16 Oct 2026",
        normalized_value: "2026-10-16",
        confidence: 95,
        source_doc_ids: ["doc-ci-01", "doc-pl-02", "doc-sb-03"],
        sources_count: 3,
        status: "CONFLICT",
        conflicting_values: [
          { doc_name: "Quality Certificate", value: "Expires 18 Oct 2026 (2-day buffer)" },
        ],
        updated_at: new Date().toISOString(),
      },
    ];

    this.goldenRecords.set("EXP-KL-2026-1042", seedGolden);

    // Seed Audit Log
    this.auditLogs.push(
      {
        id: "audit-01",
        shipment_id: "EXP-KL-2026-1042",
        user_name: "Alwin Joseph",
        user_role: "Documentation Lead",
        action: "Shipment Initialized",
        details: "Created export file EXP-KL-2026-1042 for Frozen Shrimp to Dubai.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "audit-02",
        shipment_id: "EXP-KL-2026-1042",
        user_name: "Alwin Joseph",
        user_role: "Documentation Lead",
        action: "Documents Ingested",
        details:
          "Ingested 5 trade documents: Commercial Invoice, Packing List, Shipping Bill, PO, Quality Certificate.",
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "audit-03",
        shipment_id: "EXP-KL-2026-1042",
        user_name: "VERIFAI Engine",
        user_role: "Automated System",
        action: "Verification Executed",
        details:
          "Analyzed 18 cross-document attributes. Flagged 1 Critical (qty), 1 Major (HS), 1 Warning (cert expiry).",
        created_at: new Date(Date.now() - 600000).toISOString(),
      },
    );

    // Seed Verified Public Token
    const initialToken: VerificationTokenRecord = {
      token: "vfx_token_kl2026_1042_verified",
      shipment_id: "EXP-KL-2026-1042",
      readiness_score: 84,
      status: "UNDER_REVIEW",
      commodity: "Frozen Shrimp",
      exporter: "Malabar Ocean Foods Pvt Ltd",
      destination: "Jebel Ali, UAE",
      verified_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 2592000000).toISOString(),
    };
    // Seed Multi-User Document Collection Slots for VFX-2026-001 and EXP-KL-2026-1042
    const createInitialSlots = (shipmentId: string): DocumentSlotRecord[] => [
      {
        id: `slot-ci-${shipmentId}`,
        shipment_id: shipmentId,
        document_type: "Commercial Invoice",
        required: true,
        assigned_user_id: "usr-fin",
        assigned_user_name: "Rahul Nair",
        assigned_user_role: "FINANCE",
        status: "READY",
        versions: [
          {
            version: 1,
            filename: "Commercial_Invoice_INV20261048.pdf",
            file_size: "248 KB",
            uploaded_by: "Rahul Nair",
            uploaded_by_role: "Finance Team",
            uploaded_at: new Date(Date.now() - 7200000).toISOString(),
            status: "APPROVED",
            provenance: {
              source: "Commercial Invoice",
              version: 1,
              team: "Finance Team",
              uploader: "Rahul Nair",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              page: 1,
            },
          },
        ],
        current_version: {
          version: 1,
          filename: "Commercial_Invoice_INV20261048.pdf",
          file_size: "248 KB",
          uploaded_by: "Rahul Nair",
          uploaded_by_role: "Finance Team",
          uploaded_at: new Date(Date.now() - 7200000).toISOString(),
          status: "APPROVED",
          provenance: {
            source: "Commercial Invoice",
            version: 1,
            team: "Finance Team",
            uploader: "Rahul Nair",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            page: 1,
          },
        },
        updated_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: `slot-pl-${shipmentId}`,
        shipment_id: shipmentId,
        document_type: "Packing List",
        required: true,
        assigned_user_id: "usr-wh",
        assigned_user_name: "Akhil Varma",
        assigned_user_role: "WAREHOUSE",
        status: "READY",
        versions: [
          {
            version: 1,
            filename: "Packing_List_W102.pdf",
            file_size: "186 KB",
            uploaded_by: "Akhil Varma",
            uploaded_by_role: "Warehouse Team",
            uploaded_at: new Date(Date.now() - 5400000).toISOString(),
            status: "APPROVED",
            provenance: {
              source: "Packing List",
              version: 1,
              team: "Warehouse Team",
              uploader: "Akhil Varma",
              timestamp: new Date(Date.now() - 5400000).toISOString(),
              page: 1,
            },
          },
        ],
        current_version: {
          version: 1,
          filename: "Packing_List_W102.pdf",
          file_size: "186 KB",
          uploaded_by: "Akhil Varma",
          uploaded_by_role: "Warehouse Team",
          uploaded_at: new Date(Date.now() - 5400000).toISOString(),
          status: "APPROVED",
          provenance: {
            source: "Packing List",
            version: 1,
            team: "Warehouse Team",
            uploader: "Akhil Varma",
            timestamp: new Date(Date.now() - 5400000).toISOString(),
            page: 1,
          },
        },
        updated_at: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: `slot-sb-${shipmentId}`,
        shipment_id: shipmentId,
        document_type: "Shipping Bill",
        required: true,
        assigned_user_id: "usr-cha",
        assigned_user_name: "Kavitha Menon",
        assigned_user_role: "CUSTOMS_BROKER",
        status: "WAITING",
        versions: [],
        updated_at: new Date().toISOString(),
      },
      {
        id: `slot-po-${shipmentId}`,
        shipment_id: shipmentId,
        document_type: "Purchase Order",
        required: true,
        assigned_user_id: "usr-buyer",
        assigned_user_name: "Tariq Al-Mansoor",
        assigned_user_role: "BUYER",
        status: "READY",
        versions: [
          {
            version: 1,
            filename: "PO_GFT_2291.xlsx",
            file_size: "64 KB",
            uploaded_by: "Tariq Al-Mansoor",
            uploaded_by_role: "Buyer Team",
            uploaded_at: new Date(Date.now() - 9000000).toISOString(),
            status: "APPROVED",
            provenance: {
              source: "Purchase Order",
              version: 1,
              team: "Buyer Procurement",
              uploader: "Tariq Al-Mansoor",
              timestamp: new Date(Date.now() - 9000000).toISOString(),
              page: 1,
            },
          },
        ],
        current_version: {
          version: 1,
          filename: "PO_GFT_2291.xlsx",
          file_size: "64 KB",
          uploaded_by: "Tariq Al-Mansoor",
          uploaded_by_role: "Buyer Team",
          uploaded_at: new Date(Date.now() - 9000000).toISOString(),
          status: "APPROVED",
          provenance: {
            source: "Purchase Order",
            version: 1,
            team: "Buyer Procurement",
            uploader: "Tariq Al-Mansoor",
            timestamp: new Date(Date.now() - 9000000).toISOString(),
            page: 1,
          },
        },
        updated_at: new Date(Date.now() - 9000000).toISOString(),
      },
      {
        id: `slot-qc-${shipmentId}`,
        shipment_id: shipmentId,
        document_type: "Quality Certificate",
        required: true,
        assigned_user_id: "usr-quality",
        assigned_user_name: "Dr. Ananya Pillai",
        assigned_user_role: "QUALITY",
        status: "WAITING",
        versions: [],
        updated_at: new Date().toISOString(),
      },
    ];

    this.documentSlots.set("VFX-2026-001", createInitialSlots("VFX-2026-001"));
    this.documentSlots.set("EXP-KL-2026-1042", createInitialSlots("EXP-KL-2026-1042"));
    this.documentSlots.set("EXP-ABC-2026-001", createInitialSlots("EXP-ABC-2026-001"));
  }

  public getSlots(shipmentId: string): DocumentSlotRecord[] {
    if (!this.documentSlots.has(shipmentId)) {
      const slots: DocumentSlotRecord[] = [
        {
          id: `slot-ci-${shipmentId}`,
          shipment_id: shipmentId,
          document_type: "Commercial Invoice",
          required: true,
          assigned_user_id: "usr-fin",
          assigned_user_name: "Rahul Nair",
          assigned_user_role: "FINANCE",
          status: "WAITING",
          versions: [],
          updated_at: new Date().toISOString(),
        },
        {
          id: `slot-pl-${shipmentId}`,
          shipment_id: shipmentId,
          document_type: "Packing List",
          required: true,
          assigned_user_id: "usr-wh",
          assigned_user_name: "Akhil Varma",
          assigned_user_role: "WAREHOUSE",
          status: "WAITING",
          versions: [],
          updated_at: new Date().toISOString(),
        },
        {
          id: `slot-sb-${shipmentId}`,
          shipment_id: shipmentId,
          document_type: "Shipping Bill",
          required: true,
          assigned_user_id: "usr-cha",
          assigned_user_name: "Kavitha Menon",
          assigned_user_role: "CUSTOMS_BROKER",
          status: "WAITING",
          versions: [],
          updated_at: new Date().toISOString(),
        },
        {
          id: `slot-po-${shipmentId}`,
          shipment_id: shipmentId,
          document_type: "Purchase Order",
          required: true,
          assigned_user_id: "usr-buyer",
          assigned_user_name: "Tariq Al-Mansoor",
          assigned_user_role: "BUYER",
          status: "WAITING",
          versions: [],
          updated_at: new Date().toISOString(),
        },
        {
          id: `slot-qc-${shipmentId}`,
          shipment_id: shipmentId,
          document_type: "Quality Certificate",
          required: true,
          assigned_user_id: "usr-quality",
          assigned_user_name: "Dr. Ananya Pillai",
          assigned_user_role: "QUALITY",
          status: "WAITING",
          versions: [],
          updated_at: new Date().toISOString(),
        },
      ];
      this.documentSlots.set(shipmentId, slots);
    }
    return this.documentSlots.get(shipmentId) || [];
  }

  public uploadSlotVersion(
    shipmentId: string,
    slotId: string,
    filename: string,
    size: string,
    uploader: string,
    role: string,
    notes?: string,
  ): DocumentSlotRecord | null {
    const slots = this.getSlots(shipmentId);
    const slot = slots.find(
      (s) =>
        s.id === slotId ||
        s.id.startsWith(slotId) ||
        s.document_type.toLowerCase() === slotId.toLowerCase(),
    );
    if (!slot) return null;

    const nextVer = (slot.versions?.length || 0) + 1;
    const newVersion: DocumentVersionRecord = {
      version: nextVer,
      filename,
      file_size: size || "250 KB",
      uploaded_by: uploader,
      uploaded_by_role: role,
      uploaded_at: new Date().toISOString(),
      status: "APPROVED",
      notes,
      provenance: {
        source: slot.document_type,
        version: nextVer,
        team: role,
        uploader,
        timestamp: new Date().toISOString(),
        page: 1,
      },
    };

    slot.versions = [...(slot.versions || []), newVersion];
    slot.current_version = newVersion;
    slot.status = "READY";
    slot.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      shipment_id: shipmentId,
      user_name: uploader,
      user_role: role,
      action: "Document Uploaded",
      details: `${uploader} uploaded ${slot.document_type} (Version ${nextVer}: ${filename}).`,
      created_at: new Date().toISOString(),
    });

    return slot;
  }

  public requestCorrection(
    shipmentId: string,
    slotId: string,
    reason: string,
    requestedBy: string,
  ): DocumentSlotRecord | null {
    const slots = this.getSlots(shipmentId);
    const slot = slots.find(
      (s) =>
        s.id === slotId ||
        s.id.startsWith(slotId) ||
        s.document_type.toLowerCase() === slotId.toLowerCase(),
    );
    if (!slot) return null;

    const req: CorrectionRequestRecord = {
      id: `corr-${Date.now()}`,
      slot_id: slot.id,
      discrepancy_title: "Discrepancy Correction",
      reason,
      requested_by: requestedBy,
      requested_at: new Date().toISOString(),
      assigned_to: slot.assigned_user_name,
      assigned_role: slot.assigned_user_role,
      status: "PENDING",
    };

    slot.correction_request = req;
    slot.status = "CORRECTION_REQUESTED";
    slot.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      shipment_id: shipmentId,
      user_name: requestedBy,
      user_role: "Admin",
      action: "Correction Requested",
      details: `Admin requested correction on ${slot.document_type} from ${slot.assigned_user_name}: "${reason}"`,
      created_at: new Date().toISOString(),
    });

    return slot;
  }

  public submitCorrection(
    shipmentId: string,
    slotId: string,
    filename: string,
    size: string,
    uploader: string,
    role: string,
  ): DocumentSlotRecord | null {
    const slots = this.getSlots(shipmentId);
    const slot = slots.find(
      (s) =>
        s.id === slotId ||
        s.id.startsWith(slotId) ||
        s.document_type.toLowerCase() === slotId.toLowerCase(),
    );
    if (!slot) return null;

    const nextVer = (slot.versions?.length || 0) + 1;
    const newVersion: DocumentVersionRecord = {
      version: nextVer,
      filename,
      file_size: size || "220 KB",
      uploaded_by: uploader,
      uploaded_by_role: role,
      uploaded_at: new Date().toISOString(),
      status: "UPLOADED",
      notes: "Submitted in response to correction request",
      provenance: {
        source: slot.document_type,
        version: nextVer,
        team: role,
        uploader,
        timestamp: new Date().toISOString(),
        page: 1,
      },
    };

    slot.versions = [...(slot.versions || []), newVersion];
    slot.current_version = newVersion;
    slot.status = "CORRECTION_SUBMITTED";
    if (slot.correction_request) {
      slot.correction_request.status = "SUBMITTED";
      slot.correction_request.submitted_version = nextVer;
      slot.correction_request.submitted_at = new Date().toISOString();
    }
    slot.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      shipment_id: shipmentId,
      user_name: uploader,
      user_role: role,
      action: "Correction Submitted",
      details: `${uploader} submitted corrected version ${nextVer} of ${slot.document_type} (${filename}).`,
      created_at: new Date().toISOString(),
    });

    return slot;
  }

  public approveCorrection(
    shipmentId: string,
    slotId: string,
    approvedBy: string,
  ): DocumentSlotRecord | null {
    const slots = this.getSlots(shipmentId);
    const slot = slots.find(
      (s) =>
        s.id === slotId ||
        s.id.startsWith(slotId) ||
        s.document_type.toLowerCase() === slotId.toLowerCase(),
    );
    if (!slot) return null;

    slot.status = "READY";
    if (slot.current_version) {
      slot.current_version.status = "APPROVED";
    }
    if (slot.correction_request) {
      slot.correction_request.status = "APPROVED";
    }
    slot.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      shipment_id: shipmentId,
      user_name: approvedBy,
      user_role: "Admin",
      action: "Correction Approved",
      details: `${approvedBy} approved corrected version of ${slot.document_type}. Ready for re-verification.`,
      created_at: new Date().toISOString(),
    });

    return slot;
  }

  public canStartAnalysis(shipmentId: string): {
    canStart: boolean;
    received: number;
    total: number;
    missing: string[];
  } {
    const slots = this.getSlots(shipmentId);
    const requiredSlots = slots.filter((s) => s.required);
    const missing = requiredSlots.filter((s) => s.status === "WAITING").map((s) => s.document_type);
    const received = requiredSlots.length - missing.length;
    return {
      canStart: missing.length === 0,
      received,
      total: requiredSlots.length,
      missing,
    };
  }

  public async checkPgConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const res = await this.pool.query("SELECT 1;");
      return (res.rowCount || 0) > 0;
    } catch {
      return false;
    }
  }

  public async initPostgres(): Promise<void> {
    if (!this.pool) return;
    try {
      const client = await this.pool.connect();
      try {
        // Load shipments
        const sRes = await client.query("SELECT * FROM shipments ORDER BY created_at DESC;");
        for (const row of sRes.rows) {
          this.shipments.set(row.id, {
            id: row.id,
            exporter: row.exporter,
            consignee: row.consignee,
            commodity: row.commodity,
            category: row.category,
            origin_port: row.origin_port,
            destination_port: row.destination_port,
            destination_country: row.destination_country,
            container_number: row.container_number,
            seal_number: row.seal_number,
            incoterm: row.incoterm,
            currency: row.currency,
            total_value: Number(row.total_value),
            quantity: Number(row.quantity),
            unit: row.unit,
            net_weight: Number(row.net_weight),
            gross_weight: Number(row.gross_weight),
            cbm: Number(row.cbm),
            shipment_date: row.shipment_date
              ? row.shipment_date instanceof Date
                ? row.shipment_date.toISOString().split("T")[0]
                : String(row.shipment_date)
              : undefined,
            status: row.status,
            readiness_score: row.readiness_score,
            risk_score: row.risk_score,
            issues_count: row.issues_count,
            created_by: row.created_by,
            created_at: row.created_at
              ? row.created_at instanceof Date
                ? row.created_at.toISOString()
                : String(row.created_at)
              : new Date().toISOString(),
            updated_at: row.updated_at
              ? row.updated_at instanceof Date
                ? row.updated_at.toISOString()
                : String(row.updated_at)
              : new Date().toISOString(),
          });
        }

        // Load document slots and versions
        const slotRes = await client.query("SELECT * FROM document_slots;");
        const verRes = await client.query("SELECT * FROM document_versions ORDER BY version ASC;");
        const corrRes = await client.query("SELECT * FROM correction_requests;");

        const versionsBySlot = new Map<string, DocumentVersionRecord[]>();
        for (const v of verRes.rows) {
          const list = versionsBySlot.get(v.slot_id) || [];
          list.push({
            version: v.version,
            filename: v.filename,
            file_size: v.file_size,
            uploaded_by: v.uploaded_by,
            uploaded_by_role: v.uploaded_by_role,
            uploaded_at: v.uploaded_at
              ? v.uploaded_at instanceof Date
                ? v.uploaded_at.toISOString()
                : String(v.uploaded_at)
              : new Date().toISOString(),
            status: v.status,
            notes: v.notes,
            provenance: {
              source: v.filename,
              version: v.version,
              team: v.uploaded_by_role,
              uploader: v.uploaded_by,
              timestamp: v.uploaded_at
                ? v.uploaded_at instanceof Date
                  ? v.uploaded_at.toISOString()
                  : String(v.uploaded_at)
                : new Date().toISOString(),
              page: 1,
            },
          });
          versionsBySlot.set(v.slot_id, list);
        }

        const corrBySlot = new Map<string, CorrectionRequestRecord>();
        for (const c of corrRes.rows) {
          corrBySlot.set(c.slot_id, {
            id: c.id,
            slot_id: c.slot_id,
            discrepancy_title: c.discrepancy_title,
            reason: c.reason,
            requested_by: c.requested_by,
            requested_at: c.requested_at
              ? c.requested_at instanceof Date
                ? c.requested_at.toISOString()
                : String(c.requested_at)
              : new Date().toISOString(),
            assigned_to: "Assigned Team",
            assigned_role: "WAREHOUSE",
            status: c.status,
            submitted_version: c.submitted_version,
            submitted_at: c.submitted_at
              ? c.submitted_at instanceof Date
                ? c.submitted_at.toISOString()
                : String(c.submitted_at)
              : undefined,
          });
        }

        const slotsByShipment = new Map<string, DocumentSlotRecord[]>();
        for (const r of slotRes.rows) {
          const vList = versionsBySlot.get(r.id) || [];
          const slotRecord: DocumentSlotRecord = {
            id: r.id,
            shipment_id: r.shipment_id,
            document_type: r.document_type,
            required: r.required,
            assigned_user_id: r.assigned_user_id,
            assigned_user_name: r.assigned_user_name,
            assigned_user_role: r.assigned_user_role,
            status: r.status,
            versions: vList,
            current_version: vList[vList.length - 1],
            correction_request: corrBySlot.get(r.id),
            created_at: r.created_at
              ? r.created_at instanceof Date
                ? r.created_at.toISOString()
                : String(r.created_at)
              : new Date().toISOString(),
            updated_at: r.updated_at
              ? r.updated_at instanceof Date
                ? r.updated_at.toISOString()
                : String(r.updated_at)
              : new Date().toISOString(),
          };
          const list = slotsByShipment.get(r.shipment_id) || [];
          list.push(slotRecord);
          slotsByShipment.set(r.shipment_id, list);
        }

        for (const [shipId, sList] of slotsByShipment.entries()) {
          this.documentSlots.set(shipId, sList);
        }

        this.isPostgresConnected = true;
        console.log(
          `[Neon PostgreSQL] Initialized and synchronized ${this.shipments.size} shipments, ${slotRes.rows.length} document slots.`,
        );
      } finally {
        client.release();
      }
    } catch (e) {
      console.warn("[Neon PostgreSQL] Synchronization warning:", e);
    }
  }
}

export const db = new DataStore();
