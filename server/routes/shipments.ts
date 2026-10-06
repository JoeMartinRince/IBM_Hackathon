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
