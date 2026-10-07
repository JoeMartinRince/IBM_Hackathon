import { Router, Request, Response } from "express";
import { db } from "../db";
import { calculateReadinessScore, generateReadinessChecklist } from "../engine/verification";
import { updateGoldenRecordField } from "../engine/goldenRecord";
import { simulateCustomsQueries } from "../engine/customsRisk";
import { VerificationTokenRecord } from "../types";

export const verificationRouter = Router();

// GET /api/shipments/:id/results - Comprehensive Verification Results
verificationRouter.get("/shipments/:id/results", (req: Request, res: Response) => {
  const shipmentId = req.params.id;
  const shipment = db.shipments.get(shipmentId);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }

  const allDiscrepancies = Array.from(db.discrepancies.values()).filter(
    (d) => d.shipment_id === shipmentId,
  );
  const openDiscrepancies = allDiscrepancies.filter((d) => d.status === "OPEN");
  const readiness = calculateReadinessScore(allDiscrepancies);
  const checklist = generateReadinessChecklist(shipmentId, allDiscrepancies);
  const goldenRecord = db.goldenRecords.get(shipmentId) || [];
  const customs = simulateCustomsQueries(allDiscrepancies);

  // Comparison matrix across documents (CI, PL, SB, PO)
  const isQtyResolved = !openDiscrepancies.some((d) => d.id === "qty");
  const isHsResolved = !openDiscrepancies.some((d) => d.id === "hs");
  const isCertResolved = !openDiscrepancies.some((d) => d.id === "cert");

  const comparison = [
    {
      field: "Product",
      values: {
        CI: "Frozen Shrimp 21/25",
        PL: "Frozen Shrimps (21-25 count)",
        SB: "Frozen Shrimp",
        PO: "Frozen Shrimp 21/25",
      },
      status: "verified",
    },
    {
      field: "Quantity",
      values: {
        CI: "1,200 cartons",
        PL: isQtyResolved ? "1,200 cartons" : "1,180 cartons",
        SB: "1,200 cartons",
        PO: "1,200 cartons",
      },
      status: isQtyResolved ? "verified" : "critical",
      issueId: "qty",
      fixed: "1,200 cartons",
    },
    {
      field: "Net Weight",
      values: {
        CI: "12,000 KG",
        PL: "12 MT",
        SB: "12,000 KG",
        PO: "12,000 KG",
      },
      status: "verified",
    },
    {
      field: "Gross Weight",
      values: {
        CI: "13,450 KG",
        PL: "13,450 KG",
        SB: "13,450 KG",
      },
      status: "verified",
    },
    {
      field: "HS Code",
      values: {
        CI: "030617",
        PL: "030617",
        SB: isHsResolved ? "030617" : "030616",
        PO: "030617",
      },
      status: isHsResolved ? "verified" : "critical",
      issueId: "hs",
      fixed: "030617",
    },
    {
      field: "Exporter",
      values: {
        CI: "Malabar Ocean Foods",
        PL: "Malabar Ocean Foods Pvt Ltd",
        SB: "Malabar Ocean Foods Pvt Ltd",
        PO: "Malabar Ocean Foods",
      },
      status: "verified",
    },
    {
      field: "Consignee",
      values: {
        CI: "Gulf Fresh Trading LLC",
        PL: "Gulf Fresh Trading LLC",
        SB: "Gulf Fresh Trading LLC",
        PO: "Gulf Fresh Trading",
      },
      status: "verified",
    },
    {
      field: "Destination",
      values: {
        CI: "Jebel Ali, UAE",
        PL: "Jebel Ali, UAE",
        SB: "AEJEA",
        PO: "Dubai, UAE",
      },
      status: "verified",
    },
    {
      field: "Incoterm",
      values: {
        CI: "CIF Jebel Ali",
        SB: "CIF",
        PO: "CIF",
      },
      status: "verified",
    },
    {
      field: "Port",
      values: {
        CI: "INCOK",
        PL: "Cochin",
        SB: "INCOK",
      },
      status: "verified",
    },
    {
      field: "Container Number",
      values: {
        CI: "MSKU 482915-3",
        PL: "MSKU4829153",
        SB: "MSKU 482915-3",
      },
      status: "verified",
    },
    {
      field: "Shipment Date",
      values: {
        CI: "16 Oct 2026",
        PL: "16 Oct 2026",
        SB: "16 Oct 2026",
      },
      status: isCertResolved ? "verified" : "warning",
      issueId: "cert",
      fixed: "16 Oct 2026",
    },
  ];

  res.json({
    success: true,
    shipment,
    readiness_score: readiness,
    risk_score: customs.overallRiskScore,
    discrepancies: allDiscrepancies,
    open_issues_count: openDiscrepancies.length,
    comparison,
    checklist,
    golden_record: goldenRecord,
    customs_queries: customs.queries,
  });
});

// GET /api/shipments/:id/golden-record
verificationRouter.get("/shipments/:id/golden-record", (req: Request, res: Response) => {
  const goldenRecord = db.goldenRecords.get(req.params.id) || [];
  res.json({ success: true, count: goldenRecord.length, golden_record: goldenRecord });
});

// PATCH /api/shipments/:id/golden-record/:fieldId - Resolve conflict / override value
verificationRouter.patch("/shipments/:id/golden-record/:fieldId", (req: Request, res: Response) => {
  const { value, updated_by } = req.body;
  if (!value) {
    return res.status(400).json({ success: false, error: "Value required" });
  }

  const updatedField = updateGoldenRecordField(
    req.params.id,
    req.params.fieldId,
    value,
    updated_by || "Alwin Joseph",
  );

  if (!updatedField) {
    return res.status(404).json({ success: false, error: "Golden record field not found" });
  }

  res.json({ success: true, field: updatedField });
});

// GET /api/shipments/:id/discrepancies
verificationRouter.get("/shipments/:id/discrepancies", (req: Request, res: Response) => {
  const items = Array.from(db.discrepancies.values()).filter(
    (d) => d.shipment_id === req.params.id,
  );
  res.json({ success: true, discrepancies: items });
});

// POST /api/discrepancies/:id/resolve - 1-Click Fix with human approval & audit log
verificationRouter.post("/discrepancies/:id/resolve", (req: Request, res: Response) => {
  const discrepancyId = req.params.id;
  const disc = db.discrepancies.get(discrepancyId);
  if (!disc) {
    return res.status(404).json({ success: false, error: "Discrepancy not found" });
  }

  disc.status = "RESOLVED";
  disc.resolved_at = new Date().toISOString();
  disc.resolved_by = req.body.resolved_by || "Alwin Joseph";
  db.discrepancies.set(discrepancyId, disc);

  // Update corresponding shipment stats
  const shipment = db.shipments.get(disc.shipment_id);
  if (shipment) {
    const allForShipment = Array.from(db.discrepancies.values()).filter(
      (d) => d.shipment_id === disc.shipment_id,
    );
    const openCount = allForShipment.filter((d) => d.status === "OPEN").length;
    shipment.issues_count = openCount;
    shipment.readiness_score = calculateReadinessScore(allForShipment);
    if (shipment.readiness_score >= 100) {
      shipment.status = "READY";
    } else if (openCount > 0) {
      shipment.status = "UNDER_REVIEW";
    }
    shipment.updated_at = new Date().toISOString();
    db.shipments.set(shipment.id, shipment);
  }

  // Also update corresponding Golden Record field if exists
  const goldenList = db.goldenRecords.get(disc.shipment_id);
  if (goldenList && disc.suggested_fix_value) {
    const target = goldenList.find((g) => g.label.toLowerCase() === disc.field.toLowerCase());
    if (target) {
      target.value = disc.suggested_fix_value;
      target.status = "CONFIRMED";
      target.conflicting_values = [];
      target.updated_at = new Date().toISOString();
    }
  }

  // Audit Log
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    shipment_id: disc.shipment_id,
    user_name: disc.resolved_by,
    user_role: "Documentation Reviewer",
    action: "Discrepancy Resolved",
    details: `Applied fix '${disc.fix_label}'. Recalculated readiness score to ${shipment?.readiness_score || 100}%.`,
    created_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    discrepancy: disc,
    readiness_score: shipment?.readiness_score || 100,
    open_issues_count: shipment?.issues_count || 0,
    shipment_status: shipment?.status || "READY",
  });
});

// POST /api/shipments/:id/reverify - Re-run verification engine
verificationRouter.post("/shipments/:id/reverify", (req: Request, res: Response) => {
  const shipmentId = req.params.id;
  const shipment = db.shipments.get(shipmentId);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }

  const allDiscrepancies = Array.from(db.discrepancies.values()).filter(
    (d) => d.shipment_id === shipmentId,
  );
  const openCount = allDiscrepancies.filter((d) => d.status === "OPEN").length;
  const newReadiness = calculateReadinessScore(allDiscrepancies);

  shipment.readiness_score = newReadiness;
  shipment.issues_count = openCount;
  shipment.status = newReadiness >= 100 ? "READY" : "UNDER_REVIEW";
  shipment.updated_at = new Date().toISOString();
  db.shipments.set(shipmentId, shipment);

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    shipment_id: shipmentId,
    user_name: req.body.user_name || "Alwin Joseph",
    user_role: "Documentation Lead",
    action: "Re-Verification Completed",
    details: `Automated re-verification passed with ${openCount} open issues remaining. Readiness: ${newReadiness}%.`,
    created_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    readiness_score: newReadiness,
    open_issues_count: openCount,
    status: shipment.status,
    checklist: generateReadinessChecklist(shipmentId, allDiscrepancies),
  });
});

// GET /api/shipments/:id/readiness
verificationRouter.get("/shipments/:id/readiness", (req: Request, res: Response) => {
  const shipmentId = req.params.id;
  const shipment = db.shipments.get(shipmentId);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }

  const allDiscrepancies = Array.from(db.discrepancies.values()).filter(
    (d) => d.shipment_id === shipmentId,
  );

  res.json({
    success: true,
    readiness_score: calculateReadinessScore(allDiscrepancies),
    checklist: generateReadinessChecklist(shipmentId, allDiscrepancies),
    open_issues_count: allDiscrepancies.filter((d) => d.status === "OPEN").length,
  });
});

// POST /api/shipments/:id/customs-risk
verificationRouter.post("/shipments/:id/customs-risk", (req: Request, res: Response) => {
  const shipmentId = req.params.id;
  const allDiscrepancies = Array.from(db.discrepancies.values()).filter(
    (d) => d.shipment_id === shipmentId,
  );
  const result = simulateCustomsQueries(allDiscrepancies);
  res.json({ success: true, ...result });
});

// POST /api/shipments/:id/qr - Generate verified public token
verificationRouter.post("/shipments/:id/qr", (req: Request, res: Response) => {
  const shipmentId = req.params.id;
  const shipment = db.shipments.get(shipmentId);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }

  const token = `vfx_token_${shipmentId.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`;
  const record: VerificationTokenRecord = {
    token,
    shipment_id: shipmentId,
    readiness_score: shipment.readiness_score,
    status: shipment.status,
    commodity: shipment.commodity,
    exporter: shipment.exporter,
    destination: shipment.destination_port,
    verified_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  };

  db.verificationTokens.set(token, record);

  res.json({
    success: true,
    token,
    verification_url: `/verify-status/${token}`,
    token_record: record,
  });
});

// POST /api/shipments/:id/report - Generate verification report
verificationRouter.post("/shipments/:id/report", (req: Request, res: Response) => {
  const shipmentId = req.params.id;
  const shipment = db.shipments.get(shipmentId);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }

  const allDiscrepancies = Array.from(db.discrepancies.values()).filter(
    (d) => d.shipment_id === shipmentId,
  );
  const goldenRecord = db.goldenRecords.get(shipmentId) || [];
  const checklist = generateReadinessChecklist(shipmentId, allDiscrepancies);
  const auditLogs = db.auditLogs.filter((a) => a.shipment_id === shipmentId);

  res.json({
    success: true,
    report: {
      report_id: `REP-VERIFEX-${shipmentId}-${Date.now().toString().slice(-4)}`,
      generated_at: new Date().toISOString(),
      shipment,
      readiness_score: calculateReadinessScore(allDiscrepancies),
      status: shipment.status,
      golden_record: goldenRecord,
      checklist,
      discrepancies: allDiscrepancies,
      audit_trail: auditLogs,
      verification_seal: "VERIFEX-KERALA-AI-INSPECTED-2026",
    },
  });
});
