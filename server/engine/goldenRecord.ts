import { GoldenRecordField } from "../types";
import { db } from "../db";

export function getShipmentGoldenRecord(shipmentId: string): GoldenRecordField[] {
  const existing = db.goldenRecords.get(shipmentId);
  if (existing) return existing;
  return [];
}

export function updateGoldenRecordField(
  shipmentId: string,
  fieldId: string,
  authoritativeValue: string,
  updatedBy: string
): GoldenRecordField | null {
  const recordList = db.goldenRecords.get(shipmentId);
  if (!recordList) return null;

  const target = recordList.find((f) => f.id === fieldId);
  if (!target) return null;

  target.value = authoritativeValue;
  target.normalized_value = authoritativeValue.toUpperCase().trim();
  target.status = "OVERRIDDEN";
  target.conflicting_values = [];
  target.confidence = 100;
  target.updated_at = new Date().toISOString();

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    shipment_id: shipmentId,
    user_name: updatedBy,
    user_role: "Documentation Reviewer",
    action: "Golden Record Overridden",
    details: `Manually set authoritative value for '${target.label}' to '${authoritativeValue}'.`,
    created_at: new Date().toISOString(),
  });

  return target;
}
