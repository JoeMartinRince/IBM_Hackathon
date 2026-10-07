import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in environment or .env file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log("🚀 Starting PostgreSQL Database Migration on Neon...");
  console.log(`📡 Target Host: ${new URL(connectionString!).hostname}`);

  const client = await pool.connect();
  try {
    // 1. Read schema.sql
    const schemaPath = path.resolve(process.cwd(), "server", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log("📜 Executing schema.sql statements...");
    await client.query(schemaSql);
    console.log("✅ All tables, foreign keys, and indexes created successfully!");

    // 2. Seed Default Profile
    console.log("🌱 Seeding default user profiles...");
    await client.query(`
      INSERT INTO profiles (email, name, role, organization)
      VALUES 
        ('alwinjosegeorge2028@cs.sjcetpalai.ac.in', 'Alwin Joseph', 'Government/Admin', 'Kerala Export Consortium'),
        ('finance@malabarfoods.com', 'Rahul Nair', 'Documentation Team', 'Finance & Billing Dept'),
        ('warehouse@malabarfoods.com', 'Akhil Varma', 'Documentation Team', 'Willingdon Island Terminal Logistics'),
        ('customs@cochincha.in', 'Kavitha Menon', 'Customs Broker', 'Cochin Marine Clearing Agents'),
        ('procurement@gulffresh.ae', 'Tariq Al-Mansoor', 'Exporter', 'Gulf Fresh Trading LLC, Dubai'),
        ('inspection@mpeda.gov.in', 'Dr. Ananya Pillai', 'Government/Admin', 'MPEDA Seafood Inspection Agency')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
    `);

    // 3. Seed Shipments
    console.log("🌱 Seeding realistic export consignments...");
    await client.query(`
      INSERT INTO shipments (
        id, exporter, consignee, commodity, category, origin_port, destination_port, destination_country,
        container_number, seal_number, incoterm, currency, total_value, quantity, unit, net_weight, gross_weight,
        cbm, shipment_date, status, readiness_score, risk_score, issues_count
      )
      VALUES
        (
          'VFX-2026-001', 'Malabar Ocean Foods Pvt Ltd', 'Gulf Fresh Trading LLC, Dubai', 'Frozen Black Tiger Shrimp', 'Seafood',
          'Cochin Port (INCOK)', 'Jebel Ali, Dubai (AEJEA)', 'UAE',
          'MSKU 482915-3', 'ML-2209184', 'CIF', 'USD', 128000.00, 1200.00, 'cartons', 12000.00, 13450.00,
          58.20, '2026-10-16', 'READY', 100, 12, 0
        ),
        (
          'EXP-KL-2026-1042', 'Malabar Ocean Foods Pvt Ltd', 'Gulf Fresh Trading LLC', 'Frozen Shrimp', 'Seafood',
          'Cochin (INCOK)', 'Jebel Ali, UAE (AEJEA)', 'UAE',
          'MSKU 482915-3', 'ML-2209184', 'CIF Jebel Ali', 'USD', 186400.00, 1200.00, 'cartons', 12000.00, 13450.00,
          58.20, '2026-10-16', 'UNDER_REVIEW', 84, 36, 3
        ),
        (
          'EXP-ABC-2026-001', 'ABC Seafood', 'Gulf Fresh Trading LLC, Dubai', 'Frozen Shrimp', 'Seafood',
          'Cochin Port (INCOK)', 'Dubai', 'UAE',
          'TGHU 882194-0', 'SL-994102', 'CIF', 'USD', 128000.00, 1200.00, 'cartons', 12000.00, 13450.00,
          58.20, '2026-10-18', 'READY', 100, 10, 0
        )
      ON CONFLICT (id) DO UPDATE SET
        exporter = EXCLUDED.exporter,
        consignee = EXCLUDED.consignee,
        commodity = EXCLUDED.commodity,
        readiness_score = EXCLUDED.readiness_score,
        status = EXCLUDED.status;
    `);

    // 4. Seed Document Slots for VFX-2026-001
    console.log("🌱 Seeding multi-party document slots...");
    const slots = [
      {
        id: "slot-ci-VFX-2026-001",
        type: "Commercial Invoice",
        req: true,
        uId: "usr-fin",
        uName: "Rahul Nair",
        uRole: "FINANCE",
        status: "READY",
      },
      {
        id: "slot-pl-VFX-2026-001",
        type: "Packing List",
        req: true,
        uId: "usr-wh",
        uName: "Akhil Varma",
        uRole: "WAREHOUSE",
        status: "READY",
      },
      {
        id: "slot-sb-VFX-2026-001",
        type: "Shipping Bill",
        req: true,
        uId: "usr-cha",
        uName: "Kavitha Menon",
        uRole: "CUSTOMS_BROKER",
        status: "READY",
      },
      {
        id: "slot-po-VFX-2026-001",
        type: "Purchase Order",
        req: true,
        uId: "usr-buyer",
        uName: "Tariq Al-Mansoor",
        uRole: "BUYER",
        status: "READY",
      },
      {
        id: "slot-qc-VFX-2026-001",
        type: "Quality Certificate",
        req: true,
        uId: "usr-quality",
        uName: "Dr. Ananya Pillai",
        uRole: "QUALITY",
        status: "READY",
      },
      // Slots for EXP-ABC-2026-001 (ABC Seafood - 3 required, 2 exempt)
      {
        id: "slot-ci-EXP-ABC-2026-001",
        type: "Commercial Invoice",
        req: true,
        uId: "usr-fin",
        uName: "Rahul Nair",
        uRole: "FINANCE",
        status: "READY",
      },
      {
        id: "slot-pl-EXP-ABC-2026-001",
        type: "Packing List",
        req: true,
        uId: "usr-wh",
        uName: "Akhil Varma",
        uRole: "WAREHOUSE",
        status: "READY",
      },
      {
        id: "slot-po-EXP-ABC-2026-001",
        type: "Purchase Order",
        req: true,
        uId: "usr-buyer",
        uName: "Tariq Al-Mansoor",
        uRole: "BUYER",
        status: "READY",
      },
      {
        id: "slot-sb-EXP-ABC-2026-001",
        type: "Shipping Bill",
        req: false,
        uId: "usr-cha",
        uName: "Kavitha Menon",
        uRole: "CUSTOMS_BROKER",
        status: "WAITING",
      },
      {
        id: "slot-qc-EXP-ABC-2026-001",
        type: "Quality Certificate",
        req: false,
        uId: "usr-quality",
        uName: "Dr. Ananya Pillai",
        uRole: "QUALITY",
        status: "WAITING",
      },
    ];

    for (const s of slots) {
      const shipmentId = s.id.split("-").slice(2).join("-");
      await client.query(
        `
        INSERT INTO document_slots (id, shipment_id, document_type, required, assigned_user_id, assigned_user_name, assigned_user_role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, required = EXCLUDED.required;
      `,
        [s.id, shipmentId, s.type, s.req, s.uId, s.uName, s.uRole, s.status],
      );
    }

    // 5. Seed Document Versions for VFX-2026-001
    console.log("🌱 Seeding verified document versions...");
    const versions = [
      {
        slotId: "slot-ci-VFX-2026-001",
        shipId: "VFX-2026-001",
        ver: 1,
        file: "Commercial_Invoice_INV20261048.pdf",
        size: "248 KB",
        uploader: "Rahul Nair",
        role: "Finance Specialist",
      },
      {
        slotId: "slot-pl-VFX-2026-001",
        shipId: "VFX-2026-001",
        ver: 1,
        file: "Packing_List_PL20261048.pdf",
        size: "186 KB",
        uploader: "Akhil Varma",
        role: "Warehouse Supervisor",
      },
      {
        slotId: "slot-pl-VFX-2026-001",
        shipId: "VFX-2026-001",
        ver: 2,
        file: "Packing_List_Reconciled_V2.pdf",
        size: "192 KB",
        uploader: "Akhil Varma",
        role: "Warehouse Supervisor",
      },
      {
        slotId: "slot-sb-VFX-2026-001",
        shipId: "VFX-2026-001",
        ver: 1,
        file: "Shipping_Bill_SB992144.pdf",
        size: "312 KB",
        uploader: "Kavitha Menon",
        role: "Customs Broker",
      },
      {
        slotId: "slot-po-VFX-2026-001",
        shipId: "VFX-2026-001",
        ver: 1,
        file: "Purchase_Order_PO88319.xlsx",
        size: "64 KB",
        uploader: "Tariq Al-Mansoor",
        role: "Buyer Team",
      },
      {
        slotId: "slot-qc-VFX-2026-001",
        shipId: "VFX-2026-001",
        ver: 1,
        file: "MPEDA_Health_Certificate_QC882.pdf",
        size: "1.2 MB",
        uploader: "Dr. Ananya Pillai",
        role: "Inspection Officer",
      },
    ];

    for (const v of versions) {
      await client.query(
        `
        INSERT INTO document_versions (slot_id, shipment_id, version, filename, file_size, uploaded_by, uploaded_by_role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED')
      `,
        [v.slotId, v.shipId, v.ver, v.file, v.size, v.uploader, v.role],
      );
    }

    // 6. Seed Golden Records
    console.log("🌱 Seeding Golden Consensus Records...");
    const goldenFields = [
      {
        shipId: "VFX-2026-001",
        sec: "Shipment Identifiers",
        lbl: "Invoice Number",
        val: "INV-2026-1048",
        norm: "INV20261048",
      },
      {
        shipId: "VFX-2026-001",
        sec: "Shipment Identifiers",
        lbl: "Shipping Bill No.",
        val: "SB-8829104",
        norm: "SB8829104",
      },
      {
        shipId: "VFX-2026-001",
        sec: "Commercial Values",
        lbl: "Total Invoice Value",
        val: "USD 128,000.00",
        norm: "128000",
      },
      {
        shipId: "VFX-2026-001",
        sec: "Cargo & Weights",
        lbl: "Declared Quantity",
        val: "1,200 cartons",
        norm: "1200",
      },
      {
        shipId: "VFX-2026-001",
        sec: "Cargo & Weights",
        lbl: "Net Weight",
        val: "12,000.00 kg",
        norm: "12000",
      },
      {
        shipId: "VFX-2026-001",
        sec: "Cargo & Weights",
        lbl: "Gross Weight",
        val: "13,450.00 kg",
        norm: "13450",
      },
      {
        shipId: "VFX-2026-001",
        sec: "Classification",
        lbl: "Harmonized System (HS)",
        val: "0306.17.20",
        norm: "03061720",
      },
    ];

    for (const g of goldenFields) {
      await client.query(
        `
        INSERT INTO golden_records (shipment_id, section, label, value, normalized_value, confidence, sources_count, status)
        VALUES ($1, $2, $3, $4, $5, 98, 3, 'CONFIRMED')
      `,
        [g.shipId, g.sec, g.lbl, g.val, g.norm],
      );
    }

    // 7. Seed Verification Token for Public QR Scan
    console.log("🌱 Seeding Cryptographic QR Verification Token...");
    await client.query(`
      INSERT INTO verification_tokens (token, shipment_id, readiness_score, status, commodity, exporter, destination)
      VALUES (
        'vfx_token_kl2026_1042_verified',
        'VFX-2026-001',
        100,
        'READY',
        'Frozen Black Tiger Shrimp',
        'Malabar Ocean Foods Pvt Ltd',
        'Jebel Ali, Dubai (AEJEA)'
      )
      ON CONFLICT (token) DO UPDATE SET readiness_score = EXCLUDED.readiness_score, status = EXCLUDED.status;
    `);

    // 8. Count Records
    const resShipments = await client.query("SELECT COUNT(*) FROM shipments");
    const resSlots = await client.query("SELECT COUNT(*) FROM document_slots");
    const resVersions = await client.query("SELECT COUNT(*) FROM document_versions");
    const resGolden = await client.query("SELECT COUNT(*) FROM golden_records");

    console.log("\n=======================================================");
    console.log("🎉 NEON POSTGRESQL DATABASE MIGRATION COMPLETED SUCCESSFULLY!");
    console.log(`📦 Shipments in DB:        ${resShipments.rows[0].count}`);
    console.log(`📋 Document Slots:         ${resSlots.rows[0].count}`);
    console.log(`📄 Document Versions:      ${resVersions.rows[0].count}`);
    console.log(`✨ Golden Consensus Fields: ${resGolden.rows[0].count}`);
    console.log("=======================================================\n");
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
