// Mock data + domain types. Replace these exports with API calls later.
export type ShipmentStatus = "ready" | "review" | "critical" | "archived";
export type Severity = "critical" | "major" | "warning";
export type FieldStatus = "verified" | "warning" | "critical";
export type DocType =
  | "Commercial Invoice"
  | "Packing List"
  | "Shipping Bill"
  | "Purchase Order"
  | "Quality Certificate"
  | "Other";

export interface Shipment {
  id: string;
  commodity: string;
  category: "Seafood" | "Spices" | "Rubber" | "Agriculture";
  from: string;
  to: string;
  readiness: number;
  status: ShipmentStatus;
  issues: number;
  updated: string;
  exporter: string;
  consignee: string;
  value: string;
}

export interface ShipmentDocument {
  id: string;
  filename: string;
  type: DocType;
  confidence: number;
  size: string;
}

export interface ExtractedField {
  field: string;
  values: Partial<Record<"CI" | "PL" | "SB" | "PO", string>>;
  status: FieldStatus;
  issueId?: string;
  fixed?: string;
}

export interface Discrepancy {
  id: string;
  severity: Severity;
  title: string;
  left: { doc: string; value: string };
  right: { doc: string; value: string };
  difference: string;
  explanation: string;
  action: string;
  fixLabel: string;
  weight: number;
  evidence: { source: string; field: string; value: string; confidence: number; rule: string };
}

export interface GoldenField {
  label: string;
  value: string;
  confidence: number;
  sources: number;
  issueId?: string;
}

export interface RiskQuestion {
  id: string;
  q: string;
  level: "High" | "Medium" | "Low";
  reason: string;
  docs: string[];
  action: string;
  issueId?: string;
}

export const shipments: Shipment[] = [
  { id: "EXP-KL-2026-1042", commodity: "Frozen Shrimp", category: "Seafood", from: "Cochin", to: "Dubai", readiness: 84, status: "review", issues: 3, updated: "12 min ago", exporter: "Malabar Ocean Foods Pvt Ltd", consignee: "Gulf Fresh Trading LLC", value: "USD 186,400" },
  { id: "EXP-KL-2026-1041", commodity: "Black Pepper", category: "Spices", from: "Cochin", to: "Hamburg", readiness: 100, status: "ready", issues: 0, updated: "2 h ago", exporter: "Wayanad Spice Collective", consignee: "Nordgewürz GmbH", value: "EUR 92,750" },
  { id: "EXP-KL-2026-1039", commodity: "Natural Rubber", category: "Rubber", from: "Kochi", to: "Singapore", readiness: 61, status: "critical", issues: 6, updated: "Yesterday", exporter: "Kottayam Latex Industries", consignee: "Straits Polymer Pte Ltd", value: "USD 241,000" },
  { id: "EXP-KL-2026-1037", commodity: "Cardamom", category: "Spices", from: "Cochin", to: "Dubai", readiness: 92, status: "review", issues: 1, updated: "Yesterday", exporter: "Idukki Green Pods Ltd", consignee: "Al Noor Foodstuff Co.", value: "USD 64,300" },
  { id: "EXP-KL-2026-1035", commodity: "Fresh Seafood", category: "Seafood", from: "Vizhinjam", to: "Abu Dhabi", readiness: 100, status: "ready", issues: 0, updated: "3 days ago", exporter: "Kovalam Marine Exports", consignee: "Emirates Catch FZE", value: "USD 58,900" },
  { id: "EXP-KL-2026-1031", commodity: "Coir Products", category: "Agriculture", from: "Alappuzha", to: "Rotterdam", readiness: 100, status: "archived", issues: 0, updated: "2 weeks ago", exporter: "Vembanad Coir Works", consignee: "Holland Natural BV", value: "EUR 31,200" },
];

export const demoDocuments: ShipmentDocument[] = [
  { id: "d1", filename: "invoice_oct06.pdf", type: "Commercial Invoice", confidence: 97, size: "248 KB" },
  { id: "d2", filename: "packing_final.pdf", type: "Packing List", confidence: 94, size: "186 KB" },
  { id: "d3", filename: "shipping_bill_SB4471.pdf", type: "Shipping Bill", confidence: 96, size: "312 KB" },
  { id: "d4", filename: "PO_GFT_2291.xlsx", type: "Purchase Order", confidence: 92, size: "64 KB" },
  { id: "d5", filename: "quality_cert_MPEDA.jpg", type: "Quality Certificate", confidence: 89, size: "1.2 MB" },
  { id: "d6", filename: "health_certificate.pdf", type: "Other", confidence: 88, size: "402 KB" },
];

export const docTypes: DocType[] = ["Commercial Invoice", "Packing List", "Shipping Bill", "Purchase Order", "Quality Certificate", "Other"];

export const discrepancies: Discrepancy[] = [
  {
    id: "qty", severity: "critical", title: "Quantity mismatch",
    left: { doc: "Invoice", value: "1,200 cartons" }, right: { doc: "Packing List", value: "1,180 cartons" },
    difference: "20 cartons",
    explanation: "The packing list contains 20 fewer cartons than the commercial invoice. This inconsistency may trigger a customs clarification request and delay clearance.",
    action: "Verify final packed quantity and update the inconsistent document.",
    fixLabel: "Update Packing List quantity to 1,200 cartons",
    weight: 12,
    evidence: { source: "Packing List — Page 1", field: "Quantity", value: "1,180 cartons", confidence: 96, rule: "Cross-document quantity consistency" },
  },
  {
    id: "hs", severity: "major", title: "HS Code mismatch",
    left: { doc: "Invoice", value: "030617" }, right: { doc: "Shipping Bill", value: "030616" },
    difference: "Last digit differs",
    explanation: "The Shipping Bill declares HS 030616 (cold-water shrimp) while the Invoice declares 030617 (other shrimp). Customs may reassess duty classification.",
    action: "Confirm the correct tariff line and align the Shipping Bill declaration.",
    fixLabel: "Align Shipping Bill HS Code to 030617",
    weight: 3,
    evidence: { source: "Shipping Bill — Page 2", field: "HS Code", value: "030616", confidence: 98, rule: "Tariff classification consistency" },
  },
  {
    id: "cert", severity: "warning", title: "Quality Certificate expiring",
    left: { doc: "Certificate valid until", value: "18 Oct 2026" }, right: { doc: "Planned shipment", value: "16 Oct 2026" },
    difference: "2 days of margin",
    explanation: "The quality certificate expires only 2 days after the planned shipment date. Any vessel delay would invalidate it on arrival.",
    action: "Request a renewed certificate or confirm the vessel schedule.",
    fixLabel: "Attach renewed certificate (valid until 18 Jan 2027)",
    weight: 1,
    evidence: { source: "Quality Certificate — Page 1", field: "Valid Until", value: "18 Oct 2026", confidence: 91, rule: "Certificate validity window ≥ 14 days" },
  },
];

export const comparisonFields: ExtractedField[] = [
  { field: "Product", values: { CI: "Frozen Shrimp 21/25", PL: "Frozen Shrimps (21-25 count)", SB: "Frozen Shrimp", PO: "Frozen Shrimp 21/25" }, status: "verified" },
  { field: "Quantity", values: { CI: "1,200 cartons", PL: "1,180 cartons", SB: "1,200 cartons", PO: "1,200 cartons" }, status: "critical", issueId: "qty", fixed: "1,200 cartons" },
  { field: "Net Weight", values: { CI: "12,000 KG", PL: "12 MT", SB: "12,000 KG", PO: "12,000 KG" }, status: "verified" },
  { field: "Gross Weight", values: { CI: "13,450 KG", PL: "13,450 KG", SB: "13,450 KG" }, status: "verified" },
  { field: "HS Code", values: { CI: "030617", PL: "030617", SB: "030616", PO: "030617" }, status: "critical", issueId: "hs", fixed: "030617" },
  { field: "Exporter", values: { CI: "Malabar Ocean Foods", PL: "Malabar Ocean Foods Pvt Ltd", SB: "Malabar Ocean Foods Pvt Ltd", PO: "Malabar Ocean Foods" }, status: "verified" },
  { field: "Consignee", values: { CI: "Gulf Fresh Trading LLC", PL: "Gulf Fresh Trading LLC", SB: "Gulf Fresh Trading LLC", PO: "Gulf Fresh Trading" }, status: "verified" },
  { field: "Destination", values: { CI: "Jebel Ali, UAE", PL: "Jebel Ali, UAE", SB: "AEJEA", PO: "Dubai, UAE" }, status: "verified" },
  { field: "Incoterm", values: { CI: "CIF Jebel Ali", SB: "CIF", PO: "CIF" }, status: "verified" },
  { field: "Port", values: { CI: "INCOK", PL: "Cochin", SB: "INCOK" }, status: "verified" },
  { field: "Container Number", values: { CI: "MSKU 482915-3", PL: "MSKU4829153", SB: "MSKU 482915-3" }, status: "verified" },
  { field: "Shipment Date", values: { CI: "16 Oct 2026", PL: "16 Oct 2026", SB: "16 Oct 2026" }, status: "warning", issueId: "cert", fixed: "16 Oct 2026" },
];

export const goldenRecord: { section: string; fields: GoldenField[] }[] = [
  { section: "Shipment Identity", fields: [
    { label: "Exporter", value: "Malabar Ocean Foods Pvt Ltd", confidence: 99, sources: 4 },
    { label: "Consignee", value: "Gulf Fresh Trading LLC", confidence: 98, sources: 4 },
    { label: "Destination", value: "Jebel Ali, UAE", confidence: 97, sources: 4 },
  ]},
  { section: "Product", fields: [
    { label: "Description", value: "Frozen Shrimp 21/25 count", confidence: 95, sources: 4 },
    { label: "HS Code", value: "030617", confidence: 93, sources: 3, issueId: "hs" },
    { label: "Quantity", value: "1,200 cartons", confidence: 96, sources: 3, issueId: "qty" },
  ]},
  { section: "Weight", fields: [
    { label: "Net Weight", value: "12,000 KG", confidence: 98, sources: 4 },
    { label: "Gross Weight", value: "13,450 KG", confidence: 97, sources: 3 },
    { label: "CBM", value: "58.2 m³", confidence: 94, sources: 2 },
  ]},
  { section: "Commercial", fields: [
    { label: "Unit Price", value: "USD 155.33 / carton", confidence: 97, sources: 2 },
    { label: "Total Value", value: "USD 186,400", confidence: 99, sources: 3 },
    { label: "Currency", value: "USD", confidence: 99, sources: 4 },
    { label: "Incoterm", value: "CIF Jebel Ali", confidence: 96, sources: 3 },
  ]},
  { section: "Logistics", fields: [
    { label: "Port of Loading", value: "Cochin (INCOK)", confidence: 98, sources: 3 },
    { label: "Container", value: "MSKU 482915-3", confidence: 97, sources: 3 },
    { label: "Seal", value: "ML-2209184", confidence: 92, sources: 2 },
    { label: "Shipment Date", value: "16 Oct 2026", confidence: 95, sources: 3, issueId: "cert" },
  ]},
];

export const riskQuestions: RiskQuestion[] = [
  { id: "01", q: "Why does the Packing List show 1,180 cartons while the Invoice shows 1,200?", level: "High", reason: "Quantity variance between primary commercial documents", docs: ["Invoice", "Packing List"], action: "Correct Packing List to the final packed quantity", issueId: "qty" },
  { id: "02", q: "Why does the Shipping Bill contain a different HS Code?", level: "Medium", reason: "Tariff line differs at 6-digit level", docs: ["Shipping Bill", "Invoice"], action: "Align HS classification across declarations", issueId: "hs" },
  { id: "03", q: "Is the Quality Certificate valid for this shipment date?", level: "Low", reason: "Validity margin below 14 days", docs: ["Quality Certificate"], action: "Attach renewed certificate", issueId: "cert" },
];

export const commodityRules: Record<string, string[]> = {
  Seafood: ["Species declared", "Batch / Lot number", "Count size", "Health Certificate", "Processing Plant Approval (EIC)"],
  Spices: ["Spices Board registration", "Phytosanitary certificate", "Moisture content", "Aflatoxin test report"],
  Rubber: ["Grade (RSS / ISNR)", "Dry Rubber Content (DRC)", "Rubber Board documentation"],
  Agriculture: ["Phytosanitary certificate", "Fumigation certificate", "APEDA registration"],
};

export const destinationRules: Record<string, string[]> = {
  UAE: ["Certificate of Origin (attested)", "Halal certificate", "Arabic labelling"],
  EU: ["EU-approved establishment number", "TRACES health certificate", "Catch certificate (IUU)", "Antibiotic residue report"],
  USA: ["FDA Prior Notice", "Seafood HACCP compliance", "Turtle Excluder (DS-2031)"],
  Singapore: ["SFA import permit", "Health certificate"],
  "Saudi Arabia": ["SFDA registration", "SABER conformity", "Halal certificate"],
  Germany: ["EU-approved establishment number", "TRACES health certificate", "German labelling"],
};

export const insightsData = {
  issues: [
    { name: "Weight mismatch", value: 32 },
    { name: "HS Code mismatch", value: 24 },
    { name: "Missing certificate", value: 18 },
    { name: "Quantity mismatch", value: 15 },
    { name: "Other", value: 11 },
  ],
  commodities: [
    { name: "Seafood", value: 38 },
    { name: "Spices", value: 27 },
    { name: "Rubber", value: 19 },
    { name: "Agriculture", value: 16 },
  ],
  readiness: [
    { m: "May", v: 62 }, { m: "Jun", v: 66 }, { m: "Jul", v: 71 }, { m: "Aug", v: 74 }, { m: "Sep", v: 79 }, { m: "Oct", v: 84 },
  ],
  ports: [
    { port: "Cochin", issues: 142, ready: 81 },
    { port: "Vizhinjam", issues: 38, ready: 88 },
  ],
};

export const notifications = [
  { tone: "critical" as const, title: "3 critical issues detected", sub: "Shipment EXP-KL-2026-1042", time: "12m" },
  { tone: "warning" as const, title: "Certificate expires soon", sub: "Quality Certificate · EXP-KL-2026-1042", time: "1h" },
  { tone: "success" as const, title: "Shipment EXP-KL-2026-1038 verified", sub: "Ready for export", time: "3h" },
  { tone: "success" as const, title: "Report generated", sub: "EXP-KL-2026-1041 · Black Pepper", time: "1d" },
];

export const assistantAnswers: Record<string, string> = {
  "How many cartons are in this shipment?": "The Golden Record holds **1,200 cartons** — confirmed by the Invoice, Shipping Bill and Purchase Order. Only the Packing List disagrees (1,180).",
  "Which documents contain mismatches?": "Two documents carry mismatches: the **Packing List** (quantity) and the **Shipping Bill** (HS Code). The Quality Certificate has a validity warning.",
  "Why is this shipment not ready?": "Readiness is held back by one critical quantity mismatch, one major HS Code mismatch and an expiring certificate. Resolving the quantity issue alone lifts readiness to 96%.",
  "What should I fix first?": "Start with the **quantity mismatch** — it carries the highest customs query risk (High) and the biggest readiness impact (+12%).",
  "What is the highest-risk issue?": "The quantity variance of 20 cartons. Customs officers routinely flag invoice vs packing list differences, and it is the most likely trigger for a query.",
};
