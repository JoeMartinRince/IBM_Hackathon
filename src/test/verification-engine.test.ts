import { describe, expect, it } from "vitest";
import {
  normalizeWeightToKg,
  convertToUsd,
  validateContainerNumber,
  areSemanticallyEquivalent,
  validateDateSequence,
  calculateReadinessScore,
} from "../../server/engine/verification";
import { simulateCustomsQueries } from "../../server/engine/customsRisk";
import { DiscrepancyRecord } from "../../server/types";

describe("VERIFEX AI Verification Engine", () => {
  describe("Unit Normalization", () => {
    it("converts Metric Tons (MT) to Kilograms (KG)", () => {
      expect(normalizeWeightToKg(12, "MT")).toBe(12000);
      expect(normalizeWeightToKg(2.5, "ton")).toBe(2500);
    });

    it("converts Grams (G) and Pounds (LB) to KG", () => {
      expect(normalizeWeightToKg(5000, "G")).toBe(5);
      expect(Math.round(normalizeWeightToKg(100, "LB"))).toBe(45);
    });
  });

  describe("Currency Normalization", () => {
    it("converts major export currencies to USD", () => {
      expect(convertToUsd(1000, "USD")).toBe(1000);
      expect(convertToUsd(1000, "EUR")).toBe(1080);
      expect(convertToUsd(1000, "AED")).toBe(272);
    });
  });

  describe("ISO 6346 Container Number Validation", () => {
    it("validates genuine container check digits", () => {
      // CSQU 305438-3 -> Valid check digit 3
      const result = validateContainerNumber("CSQU3054383");
      expect(result.valid).toBe(true);
      expect(validateContainerNumber("MSKU4829150").valid).toBe(true);
    });

    it("rejects invalid check digits or malformed identifiers", () => {
      const result = validateContainerNumber("MSKU4829159");
      expect(result.valid).toBe(false);
      expect(validateContainerNumber("INVALID").valid).toBe(false);
    });
  });

  describe("Semantic & Fuzzy Equivalence", () => {
    it("recognizes commercial equivalences across document descriptions", () => {
      const match = areSemanticallyEquivalent(
        "Frozen Shrimp 21/25",
        "Frozen Shrimps (21-25 count)"
      );
      expect(match).toBe(true);
    });

    it("flags distinct trade commodities as mismatched", () => {
      const match = areSemanticallyEquivalent(
        "Frozen Vannamei Shrimp",
        "Natural Rubber Grade 20"
      );
      expect(match).toBe(false);
    });
  });

  describe("Export Chronology & Date Logic", () => {
    it("accepts valid sequence: PO -> Invoice -> Shipping Bill -> Departure", () => {
      const check = validateDateSequence(
        "2026-10-01",
        "2026-10-06",
        "2026-10-10",
        "2026-10-16",
        "2027-01-18"
      );
      expect(check.valid).toBe(true);
      expect(check.issues.length).toBe(0);
    });

    it("flags an expiring certificate with tight validity margin", () => {
      const check = validateDateSequence(
        "2026-10-01",
        "2026-10-06",
        "2026-10-10",
        "2026-10-16",
        "2026-10-18" // Only 2 days buffer
      );
      expect(check.valid).toBe(false);
      expect(check.issues.some((i) => i.includes("margin"))).toBe(true);
    });
  });

  describe("Readiness Score & Customs Risk", () => {
    const mockIssues: DiscrepancyRecord[] = [
      {
        id: "qty",
        shipment_id: "TEST",
        type: "Quantity mismatch",
        field: "Quantity",
        severity: "CRITICAL",
        left_doc: "CI",
        left_value: "1200",
        right_doc: "PL",
        right_value: "1180",
        difference: "20",
        expected_value: "1200",
        actual_values: {},
        explanation: "Shortfall",
        suggested_action: "Fix",
        fix_label: "Fix",
        weight_impact: 12,
        confidence: 96,
        status: "OPEN",
        evidence: { source: "PL", field: "Qty", value: "1180", confidence: 96, rule: "Qty" },
        created_at: "",
      },
      {
        id: "hs",
        shipment_id: "TEST",
        type: "HS mismatch",
        field: "HS",
        severity: "MAJOR",
        left_doc: "CI",
        left_value: "030617",
        right_doc: "SB",
        right_value: "030616",
        difference: "Last digit",
        expected_value: "030617",
        actual_values: {},
        explanation: "HS error",
        suggested_action: "Fix",
        fix_label: "Fix",
        weight_impact: 3,
        confidence: 98,
        status: "OPEN",
        evidence: { source: "SB", field: "HS", value: "030616", confidence: 98, rule: "HS" },
        created_at: "",
      },
    ];

    it("calculates readiness with unresolved penalties (100 - 15 = 85%)", () => {
      expect(calculateReadinessScore(mockIssues)).toBe(85);
    });

    it("reaches 100% when all issues are resolved", () => {
      const resolved = mockIssues.map((m) => ({ ...m, status: "RESOLVED" as const }));
      expect(calculateReadinessScore(resolved)).toBe(100);
    });

    it("simulates high-probability customs questions for quantity mismatch", () => {
      const sim = simulateCustomsQueries(mockIssues);
      expect(sim.overallRiskScore).toBeGreaterThan(50);
      expect(sim.queries.some((q) => q.level === "High")).toBe(true);
    });
  });
});
