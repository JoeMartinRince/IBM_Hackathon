import { DocumentType } from "../types";

interface ClassificationResult {
  documentType: DocumentType;
  confidence: number;
  matchedKeywords: string[];
}

const TYPE_SIGNATURES: Record<DocumentType, string[]> = {
  "Commercial Invoice": [
    "commercial invoice",
    "tax invoice",
    "invoice no",
    "unit price",
    "total amount",
    "terms of payment",
    "consignee",
    "iec no",
  ],
  "Packing List": [
    "packing list",
    "gross weight",
    "net weight",
    "package no",
    "cartons",
    "cbm",
    "dimensions",
    "tare weight",
  ],
  "Shipping Bill": [
    "shipping bill",
    "customs copy",
    "let export",
    "leo date",
    "ritc",
    "fob value",
    "drawback",
    "port of loading",
  ],
  "Purchase Order": [
    "purchase order",
    "p.o. no",
    "order date",
    "delivery terms",
    "vendor",
    "buyer",
    "order quantity",
  ],
  "Quality Certificate": [
    "quality certificate",
    "certificate of quality",
    "health certificate",
    "inspection certificate",
    "mpeda",
    "eic",
    "lab test",
    "microbiological",
  ],
  "Certificate of Origin": [
    "certificate of origin",
    "chamber of commerce",
    "country of origin",
    "declaration by exporter",
  ],
  "Bill of Lading": [
    "bill of lading",
    "ocean bill of lading",
    "vessel",
    "voyage",
    "port of discharge",
    "shipper",
    "freight prepaid",
  ],
  Other: [],
};

export function classifyDocument(
  filename: string,
  extractedText: string = "",
): ClassificationResult {
  const normalizedFilename = filename.toLowerCase();
  const normalizedText = extractedText.toLowerCase();

  // 1. Filename heuristic boost
  if (normalizedFilename.includes("invoice") || normalizedFilename.includes("ci-")) {
    return {
      documentType: "Commercial Invoice",
      confidence: 97,
      matchedKeywords: ["filename: invoice"],
    };
  }
  if (normalizedFilename.includes("packing") || normalizedFilename.includes("pl-")) {
    return {
      documentType: "Packing List",
      confidence: 95,
      matchedKeywords: ["filename: packing list"],
    };
  }
  if (
    normalizedFilename.includes("shipping") ||
    normalizedFilename.includes("sb-") ||
    normalizedFilename.includes("sb44")
  ) {
    return {
      documentType: "Shipping Bill",
      confidence: 96,
      matchedKeywords: ["filename: shipping bill"],
    };
  }
  if (
    normalizedFilename.includes("purchase") ||
    normalizedFilename.includes("po-") ||
    normalizedFilename.includes("po_")
  ) {
    return {
      documentType: "Purchase Order",
      confidence: 94,
      matchedKeywords: ["filename: purchase order"],
    };
  }
  if (
    normalizedFilename.includes("quality") ||
    normalizedFilename.includes("cert") ||
    normalizedFilename.includes("mpeda")
  ) {
    return {
      documentType: "Quality Certificate",
      confidence: 92,
      matchedKeywords: ["filename: quality certificate"],
    };
  }

  // 2. Content text keyword matching
  let bestType: DocumentType = "Other";
  let maxMatches = 0;
  let bestKeywords: string[] = [];

  for (const [type, keywords] of Object.entries(TYPE_SIGNATURES) as [DocumentType, string[]][]) {
    const matches = keywords.filter((k) => normalizedText.includes(k));
    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      bestType = type;
      bestKeywords = matches;
    }
  }

  if (maxMatches >= 3) {
    const confidence = Math.min(98, 75 + maxMatches * 5);
    return { documentType: bestType, confidence, matchedKeywords: bestKeywords };
  }

  if (maxMatches >= 1) {
    return { documentType: bestType, confidence: 78, matchedKeywords: bestKeywords };
  }

  return { documentType: "Other", confidence: 50, matchedKeywords: [] };
}
