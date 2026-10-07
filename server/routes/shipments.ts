import { Router, Request, Response } from "express";
import { db } from "../db";
import { ShipmentRecord } from "../types";

export const shipmentsRouter = Router();

// GET /api/shipments - List shipments with optional filtering & search
shipmentsRouter.get("/", (req: Request, res: Response) => {
  const { category, status, search } = req.query;
  let items = Array.from(db.shipments.values());

  if (category && typeof category === "string" && category !== "all") {
    items = items.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  if (status && typeof status === "string" && status !== "all") {
    items = items.filter((s) => s.status.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    items = items.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.commodity.toLowerCase().includes(q) ||
        s.exporter.toLowerCase().includes(q) ||
        s.consignee.toLowerCase().includes(q) ||
        s.origin_port.toLowerCase().includes(q) ||
        s.destination_port.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: items.length, shipments: items });
});

// GET /api/shipments/:id - Get single shipment
shipmentsRouter.get("/:id", (req: Request, res: Response) => {
  const shipment = db.shipments.get(req.params.id);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }
  res.json({ success: true, shipment });
});

// POST /api/shipments - Create a new shipment
shipmentsRouter.post("/", (req: Request, res: Response) => {
  const body = req.body;
  if (!body.commodity || !body.exporter || !body.consignee) {
    return res.status(400).json({ success: false, error: "Missing required fields (commodity, exporter, consignee)" });
  }

  const id = `EXP-KL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newShipment: ShipmentRecord = {
    id,
    exporter: body.exporter,
    consignee: body.consignee,
    commodity: body.commodity,
    category: body.category || "Seafood",
    origin_port: body.origin_port || "Cochin (INCOK)",
    destination_port: body.destination_port || "Jebel Ali, UAE",
    destination_country: body.destination_country || "UAE",
    container_number: body.container_number || "MSKU 482915-3",
    seal_number: body.seal_number || "ML-2209184",
    incoterm: body.incoterm || "CIF",
    currency: body.currency || "USD",
    total_value: Number(body.total_value) || 100000,
    quantity: Number(body.quantity) || 1000,
    unit: body.unit || "cartons",
    net_weight: Number(body.net_weight) || 10000,
    gross_weight: Number(body.gross_weight) || 11200,
    cbm: Number(body.cbm) || 45.0,
    shipment_date: body.shipment_date || new Date().toISOString().split("T")[0],
    status: "DRAFT",
    readiness_score: 50,
    risk_score: 40,
    issues_count: 0,
    created_by: "u-alwin-01",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.shipments.set(id, newShipment);

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    shipment_id: id,
    user_name: "Alwin Joseph",
    user_role: "Documentation Lead",
    action: "Shipment Created",
    details: `Created new export shipment file ${id} for ${newShipment.commodity}.`,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ success: true, shipment: newShipment });
});

// PATCH /api/shipments/:id - Update shipment
shipmentsRouter.patch("/:id", (req: Request, res: Response) => {
  const shipment = db.shipments.get(req.params.id);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }

  const updated = { ...shipment, ...req.body, updated_at: new Date().toISOString() };
  db.shipments.set(req.params.id, updated);
  res.json({ success: true, shipment: updated });
});

// GET /api/shipments/:id/slots - Document collection slots & completion status
shipmentsRouter.get("/:id/slots", (req: Request, res: Response) => {
  const shipment = db.shipments.get(req.params.id);
  if (!shipment) {
    return res.status(404).json({ success: false, error: "Shipment not found" });
  }

  const slots = db.getSlots(req.params.id);
  const check = db.canStartAnalysis(req.params.id);

  res.json({
    success: true,
    shipment_id: req.params.id,
    slots,
    received: check.received,
    total: check.total,
    missing: check.missing,
    can_start: check.canStart,
  });
});

// POST /api/shipments/:id/slots/:slotId/upload - Upload a document version to slot
shipmentsRouter.post("/:id/slots/:slotId/upload", (req: Request, res: Response) => {
  const { filename, file_size, uploader, role, notes } = req.body;
  const updatedSlot = db.uploadSlotVersion(
    req.params.id,
    req.params.slotId,
    filename || "uploaded_document.pdf",
    file_size || "240 KB",
    uploader || "Document User",
    role || "User",
    notes
  );

  if (!updatedSlot) {
    return res.status(404).json({ success: false, error: "Slot not found" });
  }

  const check = db.canStartAnalysis(req.params.id);
  res.json({
    success: true,
    slot: updatedSlot,
    received: check.received,
    total: check.total,
    missing: check.missing,
    can_start: check.canStart,
  });
});

// POST /api/shipments/:id/slots/:slotId/request-correction - Admin requests correction
shipmentsRouter.post("/:id/slots/:slotId/request-correction", (req: Request, res: Response) => {
  const { reason, requested_by } = req.body;
  if (!reason) {
    return res.status(400).json({ success: false, error: "Reason for correction is required" });
  }

  const updatedSlot = db.requestCorrection(
    req.params.id,
    req.params.slotId,
    reason,
    requested_by || "Admin"
  );

  if (!updatedSlot) {
    return res.status(404).json({ success: false, error: "Slot not found" });
  }

  res.json({ success: true, slot: updatedSlot });
});

// POST /api/shipments/:id/slots/:slotId/submit-correction - User submits corrected version
shipmentsRouter.post("/:id/slots/:slotId/submit-correction", (req: Request, res: Response) => {
  const { filename, file_size, uploader, role } = req.body;
  const updatedSlot = db.submitCorrection(
    req.params.id,
    req.params.slotId,
    filename || "corrected_document.pdf",
    file_size || "220 KB",
    uploader || "Warehouse Team",
    role || "WAREHOUSE"
  );

  if (!updatedSlot) {
    return res.status(404).json({ success: false, error: "Slot not found" });
  }

  res.json({ success: true, slot: updatedSlot });
});

// POST /api/shipments/:id/slots/:slotId/approve-correction - Admin approves correction
shipmentsRouter.post("/:id/slots/:slotId/approve-correction", (req: Request, res: Response) => {
  const { approved_by } = req.body;
  const updatedSlot = db.approveCorrection(
    req.params.id,
    req.params.slotId,
    approved_by || "Alwin Joseph"
  );

  if (!updatedSlot) {
    return res.status(404).json({ success: false, error: "Slot not found" });
  }

  // Also auto-resolve the discrepancy in demo store if packing list was corrected to 1200
  const qtyDisc = db.discrepancies.get("qty");
  if (qtyDisc) {
    qtyDisc.status = "RESOLVED";
    qtyDisc.resolved_by = approved_by || "Alwin Joseph";
    qtyDisc.resolved_at = new Date().toISOString();
  }

  const shipment = db.shipments.get(req.params.id);
  if (shipment) {
    shipment.readiness_score = 100;
    shipment.issues_count = 0;
    shipment.status = "READY";
  }

  res.json({ success: true, slot: updatedSlot, readiness: 100 });
});

// POST /api/shipments/:id/start-analysis - Admin triggers AI analysis (Gated by 5/5 check)
shipmentsRouter.post("/:id/start-analysis", (req: Request, res: Response) => {
  const check = db.canStartAnalysis(req.params.id);
  if (!check.canStart) {
    return res.status(400).json({
      success: false,
      error: `Cannot start AI verification while required documents are missing. Waiting for ${check.missing.join(", ")} (${check.received}/${check.total} received).`,
      missing: check.missing,
      received: check.received,
      total: check.total,
    });
  }

  const shipment = db.shipments.get(req.params.id);
  if (shipment) {
    shipment.status = "UNDER_REVIEW";
    shipment.updated_at = new Date().toISOString();
  }

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    shipment_id: req.params.id,
    user_name: req.body.admin_name || "Alwin Joseph",
    user_role: "Admin",
    action: "AI Analysis Started",
    details: `Admin triggered complete AI verification pipeline across all ${check.total} received documents.`,
    created_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "AI analysis initiated across complete document collection.",
    shipment_id: req.params.id,
    readiness: shipment?.readiness_score || 84,
  });
});

// GET /api/shipments/:id/audit-trail - Audit log entries for shipment
shipmentsRouter.get("/:id/audit-trail", (req: Request, res: Response) => {
  const logs = db.auditLogs.filter((l) => l.shipment_id === req.params.id);
  res.json({ success: true, shipment_id: req.params.id, logs });
});

