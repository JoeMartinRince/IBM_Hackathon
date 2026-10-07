import { describe, expect, it, beforeEach } from "vitest";
import { DataStore } from "../../server/db";
import { initialDocumentSlots, demoUsers } from "../lib/data";

describe("VERIFAI Multi-User Document Collection & Verification Workflow", () => {
  let db: DataStore;

  beforeEach(() => {
    db = new DataStore();
  });

  describe("Document Slots Configuration & Role Assignments", () => {
    it("configures exactly 5 required document slots for VFX-2026-001 in backend store", () => {
      const slots = db.getSlots("VFX-2026-001");
      expect(slots.length).toBe(5);

      const types = slots.map((s) => s.document_type);
      expect(types).toContain("Commercial Invoice");
      expect(types).toContain("Packing List");
      expect(types).toContain("Shipping Bill");
      expect(types).toContain("Purchase Order");
      expect(types).toContain("Quality Certificate");
    });

    it("assigns each document slot to the correct department specialist", () => {
      const slots = db.getSlots("VFX-2026-001");

      const ciSlot = slots.find((s) => s.document_type === "Commercial Invoice");
      expect(ciSlot?.assigned_user_role).toBe("FINANCE");
      expect(ciSlot?.assigned_user_name).toBe("Rahul Nair");

      const plSlot = slots.find((s) => s.document_type === "Packing List");
      expect(plSlot?.assigned_user_role).toBe("WAREHOUSE");
      expect(plSlot?.assigned_user_name).toBe("Akhil Varma");

      const sbSlot = slots.find((s) => s.document_type === "Shipping Bill");
      expect(sbSlot?.assigned_user_role).toBe("CUSTOMS_BROKER");
      expect(sbSlot?.assigned_user_name).toBe("Kavitha Menon");

      const poSlot = slots.find((s) => s.document_type === "Purchase Order");
      expect(poSlot?.assigned_user_role).toBe("BUYER");
      expect(poSlot?.assigned_user_name).toBe("Tariq Al-Mansoor");

      const qcSlot = slots.find((s) => s.document_type === "Quality Certificate");
      expect(qcSlot?.assigned_user_role).toBe("QUALITY");
      expect(qcSlot?.assigned_user_name).toBe("Dr. Ananya Pillai");
    });

    it("mirrors the 5 slots in frontend initialDocumentSlots with assigned persona objects", () => {
      const frontendSlots = initialDocumentSlots["VFX-2026-001"]!;
      expect(frontendSlots.length).toBe(5);

      const roles = frontendSlots.map((s) => s.assignedToUser.role);
      expect(roles).toEqual(["FINANCE", "WAREHOUSE", "CUSTOMS_BROKER", "BUYER", "QUALITY"]);
    });
  });

  describe("Admin 5/5 Gating Enforcement", () => {
    it("strictly prevents starting AI analysis when only 3 of 5 documents are present", () => {
      const check = db.canStartAnalysis("VFX-2026-001");
      expect(check.canStart).toBe(false);
      expect(check.received).toBe(3);
      expect(check.total).toBe(5);
      expect(check.missing).toContain("Shipping Bill");
      expect(check.missing).toContain("Quality Certificate");
    });

    it("unlocks AI analysis only after all 5 documents are received", () => {
      // Customs Broker uploads Shipping Bill
      db.uploadSlotVersion(
        "VFX-2026-001",
        "slot-sb",
        "Shipping_Bill_SB4471_CochinCustoms.pdf",
        "312 KB",
        "Kavitha Menon",
        "CUSTOMS_BROKER",
      );

      // Still gated (4/5)
      let check = db.canStartAnalysis("VFX-2026-001");
      expect(check.canStart).toBe(false);
      expect(check.received).toBe(4);
      expect(check.missing).toEqual(["Quality Certificate"]);

      // Quality Officer uploads Quality Certificate
      db.uploadSlotVersion(
        "VFX-2026-001",
        "slot-qc",
        "MPEDA_Health_Certificate_QC992.pdf",
        "1.2 MB",
        "Dr. Ananya Pillai",
        "QUALITY",
      );

      // Now 5/5 present -> Verification UNLOCKED
      check = db.canStartAnalysis("VFX-2026-001");
      expect(check.canStart).toBe(true);
      expect(check.received).toBe(5);
      expect(check.missing.length).toBe(0);
    });
  });

  describe("Discrepancy Correction Lifecycle (Warehouse Packing List V1 -> V2)", () => {
    it("handles Admin correction request, Warehouse V2 submission, and Admin approval to reach 100% readiness", () => {
      const shipmentId = "VFX-2026-001";

      // 1. Initial State: Shipment has quantity conflict (1,200 vs 1,180 cartons)
      const plSlot = db.getSlots(shipmentId).find((s) => s.document_type === "Packing List");
      expect(plSlot).toBeDefined();
      expect(plSlot?.versions.length).toBe(1);
      expect(plSlot?.status).toBe("READY");

      // 2. Admin requests correction with specific reason
      const reason =
        "Commercial Invoice declares 1,200 cartons, but Packing List specifies 1,180 cartons. Please recount Willingdon lot.";
      const requested = db.requestCorrection(shipmentId, "slot-pl", reason, "Alwin Joseph");

      expect(requested?.status).toBe("CORRECTION_REQUESTED");
      expect(requested?.correction_request?.status).toBe("PENDING");
      expect(requested?.correction_request?.reason).toBe(reason);

      // 3. Warehouse team (Akhil Varma) uploads corrected Version 2
      const submitted = db.submitCorrection(
        shipmentId,
        "slot-pl",
        "Packing_List_V2_Corrected_1200ctns.pdf",
        "194 KB",
        "Akhil Varma",
        "WAREHOUSE",
      );

      expect(submitted?.status).toBe("CORRECTION_SUBMITTED");
      expect(submitted?.versions.length).toBe(2);
      expect(submitted?.versions[1]?.version).toBe(2);
      expect(submitted?.current_version?.version).toBe(2);
      expect(submitted?.correction_request?.status).toBe("SUBMITTED");

      // 4. Admin reviews and approves corrected Version 2
      const approved = db.approveCorrection(shipmentId, "slot-pl", "Alwin Joseph");

      expect(approved?.status).toBe("READY");
      expect(approved?.correction_request?.status).toBe("APPROVED");
      expect(approved?.current_version?.status).toBe("APPROVED");

      // Discrepancy auto-resolved and audit logged
      const logs = db.auditLogs.filter((l) => l.shipment_id === shipmentId);
      expect(logs.some((l) => l.action.includes("Approved"))).toBe(true);
    });
  });

  describe("New Export Consignment Workflow (ABC Seafood - Frozen Shrimp)", () => {
    it("initializes consignment with 3 uploaded documents and 2 waiting documents", () => {
      const abcSlots = db.getSlots("EXP-ABC-2026-001");
      expect(abcSlots.length).toBe(5);

      const readySlots = abcSlots.filter((s) => s.status === "READY");
      const waitingSlots = abcSlots.filter((s) => s.status === "WAITING");

      expect(readySlots.length).toBe(3);
      expect(readySlots.map((s) => s.document_type)).toEqual([
        "Commercial Invoice",
        "Packing List",
        "Purchase Order",
      ]);

      expect(waitingSlots.length).toBe(2);
      expect(waitingSlots.map((s) => s.document_type)).toEqual([
        "Shipping Bill",
        "Quality Certificate",
      ]);

      // Gating prevents analysis with 3/5 documents
      const check = db.canStartAnalysis("EXP-ABC-2026-001");
      expect(check.canStart).toBe(false);
      expect(check.received).toBe(3);
      expect(check.total).toBe(5);
      expect(check.missing).toEqual(["Shipping Bill", "Quality Certificate"]);
    });
  });
});
