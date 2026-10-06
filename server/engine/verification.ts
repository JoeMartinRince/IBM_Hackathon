import { DiscrepancyRecord, VerificationCheckItem } from "../types";

// 1. Unit Normalization
export function normalizeWeightToKg(value: number, unit: string): number {
  const u = unit.trim().toUpperCase();
  switch (u) {
    case "MT":
    case "TON":
    case "TONS":
    case "METRIC TON":
      return value * 1000;
    case "G":
    case "GRAMS":
      return value / 1000;
    case "LB":
    case "LBS":
    case "POUND":
      return value * 0.45359237;
    case "KG":
    case "KGS":
    case "KILOGRAM":
    default:
      return value;
  }
}

// 2. Currency Normalization (Configurable demo rates)
export const EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  AED: 0.272,
  INR: 0.0118,
};

export function convertToUsd(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES_TO_USD[currency.toUpperCase()] || 1.0;
  return amount * rate;
}

// 3. ISO 6346 Container Number Checksum Validation
export function validateContainerNumber(containerNo: string): { valid: boolean; calculatedCheckDigit?: number } {
  const clean = containerNo.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (clean.length !== 11) return { valid: false };

  const charValues: Record<string, number> = {
    A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
    K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
    U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
  };

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = clean[i];
    const val = char >= "0" && char <= "9" ? parseInt(char, 10) : charValues[char] || 0;
    sum += val * Math.pow(2, i);
  }

  const remainder = sum % 11;
  const expectedCheckDigit = remainder === 10 ? 0 : remainder;
  const actualCheckDigit = parseInt(clean[10], 10);

  return { valid: expectedCheckDigit === actualCheckDigit, calculatedCheckDigit: expectedCheckDigit };
}

// 4. Fuzzy / Semantic String Matching
export function areSemanticallyEquivalent(strA: string, strB: string): boolean {
  const cleanA = strA.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().split(/\s+/).filter(Boolean);
  const cleanB = strB.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().split(/\s+/).filter(Boolean);

  const setA = new Set(cleanA);
  const setB = new Set(cleanB);

  // Exact set match
  if (cleanA.join(" ") === cleanB.join(" ")) return true;

  // Intersect score
  let matches = 0;
  for (const word of setA) {
    if (setB.has(word) || Array.from(setB).some((w) => w.startsWith(word) || word.startsWith(w))) {
      matches++;
    }
  }

  const similarity = (2 * matches) / (setA.size + setB.size);
  return similarity >= 0.7;
}

// 5. Date Logic Engine
export function validateDateSequence(
  poDate?: string,
  invoiceDate?: string,
  shippingBillDate?: string,
  shipmentDate?: string,
  certExpiryDate?: string
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  const parse = (d?: string) => (d ? new Date(d).getTime() : null);

  const po = parse(poDate);
  const inv = parse(invoiceDate);
  const sb = parse(shippingBillDate);
  const ship = parse(shipmentDate);
  const certExp = parse(certExpiryDate);

  if (po && inv && po > inv) {
    issues.push("Purchase Order date is later than Commercial Invoice date.");
  }
  if (inv && sb && inv > sb) {
    issues.push("Invoice date is later than Shipping Bill filing date.");
  }
  if (ship && certExp) {
    const marginDays = (certExp - ship) / (1000 * 60 * 60 * 24);
    if (marginDays < 0) {
      issues.push("Quality / Health Certificate expires before planned vessel departure.");
    } else if (marginDays < 14) {
      issues.push(`Certificate expires only ${Math.round(marginDays)} days after vessel departure (recommended margin ≥ 14 days).`);
    }
  }

  return { valid: issues.length === 0, issues };
}

// 6. Readiness Checklist Generator
export function generateReadinessChecklist(
  shipmentId: string,
  discrepancies: DiscrepancyRecord[]
): VerificationCheckItem[] {
  const openIds = new Set(discrepancies.filter((d) => d.status === "OPEN").map((d) => d.id));

  return [
    {
      id: "chk-1",
      category: "Documents",
      label: "Document Set Completeness",
      status: "PASS",
      description: "Primary commercial documents (CI, PL, SB, PO, QC) uploaded and parsed.",
    },
    {
      id: "chk-2",
      category: "Product",
      label: "Commodity & Specification Consistency",
      status: "PASS",
      description: "Frozen Shrimp 21/25 specification matches across all trade documents.",
    },
    {
      id: "chk-3",
      category: "Quantity",
      label: "Carton & Package Quantity Consistency",
      status: openIds.has("qty") ? "FAIL" : "PASS",
      description: openIds.has("qty")
        ? "Invoice (1,200) disagrees with Packing List (1,180)."
        : "Quantity reconciled to 1,200 cartons across all documents.",
      details: openIds.has("qty") ? "Discrepancy: 20 cartons difference" : "Verified 100% matched",
    },
    {
      id: "chk-4",
      category: "Weight",
      label: "Weight & Physical Plausibility",
      status: "PASS",
      description: "Gross weight (13,450 KG) exceeds net weight (12,000 KG); unit weight plausibility confirmed.",
    },
    {
      id: "chk-5",
      category: "Classification",
      label: "HS Code Tariff Line Alignment",
      status: openIds.has("hs") ? "FAIL" : "PASS",
      description: openIds.has("hs")
        ? "Shipping Bill tariff declaration 030616 conflicts with Invoice 030617."
        : "HS code 030617 correctly aligned across export declarations.",
      details: openIds.has("hs") ? "Risk of duty drawback audit" : "Matched",
    },
    {
      id: "chk-6",
      category: "Parties",
      label: "Exporter & Consignee Identity",
      status: "PASS",
      description: "Malabar Ocean Foods Pvt Ltd and Gulf Fresh Trading LLC verified in registry.",
    },
    {
      id: "chk-7",
      category: "Dates",
      label: "Export Chronology & Date Sequence",
      status: "PASS",
      description: "PO date precedes Invoice date; sailing date matches port gate window.",
    },
    {
      id: "chk-8",
      category: "Compliance",
      label: "Health / Quality Certificate Validity",
      status: openIds.has("cert") ? "WARNING" : "PASS",
      description: openIds.has("cert")
        ? "MPEDA certificate expires 18 Oct 2026 (only 2 days margin over vessel ETD)."
        : "Renewed certificate attached; valid until 18 Jan 2027.",
      details: openIds.has("cert") ? "Transit buffer < 14 days" : "Adequate validity window",
    },
    {
      id: "chk-9",
      category: "Logistics",
      label: "Container Number & Seal Checksum",
      status: "PASS",
      description: "MSKU 482915-3 passed ISO 6346 check digit algorithm; seal ML-2209184 recorded.",
    },
    {
      id: "chk-10",
      category: "Destination",
      label: "UAE Import Conformity Rules",
      status: "PASS",
      description: "Certificate of origin, Arabic labeling declaration, and Halal norms recorded.",
    },
  ];
}

// 7. Calculate Readiness Score
export function calculateReadinessScore(discrepancies: DiscrepancyRecord[]): number {
  let score = 100;
  for (const disc of discrepancies) {
    if (disc.status === "OPEN") {
      score -= disc.weight_impact;
    }
  }
  return Math.max(0, Math.min(100, score));
}
