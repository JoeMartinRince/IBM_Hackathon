import { DocumentType } from "../types";

export interface ExtractedFieldItem {
  fieldName: string;
  rawValue: string;
  normalizedValue: string;
  confidence: number;
  pageNumber: number;
  snippet: string;
}

export function extractStructuredFields(
  documentType: DocumentType,
  text: string,
  filename: string
): ExtractedFieldItem[] {
  const fields: ExtractedFieldItem[] = [];

  // Helper regex search
  const findMatch = (regex: RegExp, groupIndex: number = 1): string | null => {
    const match = text.match(regex);
    return match && match[groupIndex] ? match[groupIndex].trim() : null;
  };

  // 1. Commercial Invoice
  if (documentType === "Commercial Invoice") {
    fields.push({
      fieldName: "Exporter",
      rawValue: findMatch(/Exporter[:\s]+([^\n\r]+)/i) || "Malabar Ocean Foods Pvt Ltd",
      normalizedValue: "MALABAR OCEAN FOODS PVT LTD",
      confidence: 99,
      pageNumber: 1,
      snippet: "EXPORTER: Malabar Ocean Foods Pvt Ltd, Wellington Island, Cochin 682003",
    });
    fields.push({
      fieldName: "Consignee",
      rawValue: findMatch(/Consignee[:\s]+([^\n\r]+)/i) || "Gulf Fresh Trading LLC",
      normalizedValue: "GULF FRESH TRADING LLC",
      confidence: 98,
      pageNumber: 1,
      snippet: "CONSIGNEE: Gulf Fresh Trading LLC, Al Ras, Deira, Dubai, UAE",
    });
    fields.push({
      fieldName: "Product",
      rawValue: findMatch(/Description[:\s]+([^\n\r]+)/i) || "Frozen Shrimp 21/25",
      normalizedValue: "FROZEN SHRIMP 21/25",
      confidence: 97,
      pageNumber: 1,
      snippet: "GOODS: Frozen Indian Black Tiger / Vannamei Shrimp, Grade 21/25 IQF",
    });
    fields.push({
      fieldName: "Quantity",
      rawValue: findMatch(/(\d+[\d,]*\s*cartons)/i) || "1,200 cartons",
      normalizedValue: "1200",
      confidence: 98,
      pageNumber: 1,
      snippet: "QUANTITY: 1,200 Master Cartons (10kg each)",
    });
    fields.push({
      fieldName: "Net Weight",
      rawValue: findMatch(/Net\s*Weight[:\s]+([^\n\r]+)/i) || "12,000 KG",
      normalizedValue: "12000",
      confidence: 98,
      pageNumber: 1,
      snippet: "NET WEIGHT: 12,000.00 KGS",
    });
    fields.push({
      fieldName: "Gross Weight",
      rawValue: findMatch(/Gross\s*Weight[:\s]+([^\n\r]+)/i) || "13,450 KG",
      normalizedValue: "13450",
      confidence: 97,
      pageNumber: 1,
      snippet: "GROSS WEIGHT: 13,450.00 KGS",
    });
    fields.push({
      fieldName: "HS Code",
      rawValue: findMatch(/HS\s*Code[:\s]+(\d{6,8})/i) || "030617",
      normalizedValue: "030617",
      confidence: 97,
      pageNumber: 1,
      snippet: "ITC (HS) CODE: 0306.17.90 — Other Shrimps and Prawns Frozen",
    });
    fields.push({
      fieldName: "Total Value",
      rawValue: findMatch(/Total[:\s]+(USD\s*[\d,.]+)/i) || "USD 186,400",
      normalizedValue: "186400",
      confidence: 99,
      pageNumber: 1,
      snippet: "INVOICE TOTAL: USD 186,400.00 (CIF Jebel Ali)",
    });
    fields.push({
      fieldName: "Currency",
      rawValue: "USD",
      normalizedValue: "USD",
      confidence: 99,
      pageNumber: 1,
      snippet: "CURRENCY: UNITED STATES DOLLAR (USD)",
    });
    fields.push({
      fieldName: "Incoterm",
      rawValue: "CIF Jebel Ali",
      normalizedValue: "CIF",
      confidence: 96,
      pageNumber: 1,
      snippet: "TERMS OF DELIVERY: CIF Jebel Ali Port, UAE",
    });
    fields.push({
      fieldName: "Container Number",
      rawValue: "MSKU 482915-3",
      normalizedValue: "MSKU4829153",
      confidence: 97,
      pageNumber: 1,
      snippet: "CONTAINER NO: MSKU 482915-3 / 40FT REEFER",
    });
    fields.push({
      fieldName: "Shipment Date",
      rawValue: "16 Oct 2026",
      normalizedValue: "2026-10-16",
      confidence: 95,
      pageNumber: 1,
      snippet: "PLANNED SAILING DATE: 16-OCT-2026",
    });
  }

  // 2. Packing List
  else if (documentType === "Packing List") {
    fields.push({
      fieldName: "Exporter",
      rawValue: "Malabar Ocean Foods Pvt Ltd",
      normalizedValue: "MALABAR OCEAN FOODS PVT LTD",
      confidence: 98,
      pageNumber: 1,
      snippet: "SHIPPER: Malabar Ocean Foods Pvt Ltd",
    });
    fields.push({
      fieldName: "Consignee",
      rawValue: "Gulf Fresh Trading LLC",
      normalizedValue: "GULF FRESH TRADING LLC",
      confidence: 98,
      pageNumber: 1,
      snippet: "CONSIGNEE: Gulf Fresh Trading LLC, Dubai",
    });
    fields.push({
      fieldName: "Product",
      rawValue: "Frozen Shrimps (21-25 count)",
      normalizedValue: "FROZEN SHRIMP 21/25",
      confidence: 95,
      pageNumber: 1,
      snippet: "PACKING DETAILS: Frozen Shrimps (21-25 count) in 10x1kg poly packs",
    });
    fields.push({
      fieldName: "Quantity",
      // Discrepancy point in demo
      rawValue: "1,180 cartons",
      normalizedValue: "1180",
      confidence: 96,
      pageNumber: 1,
      snippet: "TOTAL PACKAGES TALLIED: 1,180 MASTER CARTONS",
    });
    fields.push({
      fieldName: "Net Weight",
      rawValue: "11,800 KG",
      normalizedValue: "11800",
      confidence: 96,
      pageNumber: 1,
      snippet: "TOTAL NET WEIGHT: 11,800 KGS",
    });
    fields.push({
      fieldName: "Gross Weight",
      rawValue: "13,450 KG",
      normalizedValue: "13450",
      confidence: 97,
      pageNumber: 1,
      snippet: "TOTAL GROSS WEIGHT: 13,450.00 KGS",
    });
    fields.push({
      fieldName: "CBM",
      rawValue: "58.2 m³",
      normalizedValue: "58.2",
      confidence: 94,
      pageNumber: 1,
      snippet: "MEASUREMENT: 58.20 CBM",
    });
    fields.push({
      fieldName: "Container Number",
      rawValue: "MSKU4829153",
      normalizedValue: "MSKU4829153",
      confidence: 97,
      pageNumber: 1,
      snippet: "STUFFED IN CONTAINER: MSKU4829153 / SEAL: ML-2209184",
    });
  }

  // 3. Shipping Bill
  else if (documentType === "Shipping Bill") {
    fields.push({
      fieldName: "Exporter",
      rawValue: "Malabar Ocean Foods Pvt Ltd",
      normalizedValue: "MALABAR OCEAN FOODS PVT LTD",
      confidence: 99,
      pageNumber: 1,
      snippet: "IEC: 1004819201 | EXPORTER: MALABAR OCEAN FOODS PVT LTD",
    });
    fields.push({
      fieldName: "Consignee",
      rawValue: "Gulf Fresh Trading LLC",
      normalizedValue: "GULF FRESH TRADING LLC",
      confidence: 99,
      pageNumber: 1,
      snippet: "CONSIGNEE: GULF FRESH TRADING LLC, DUBAI, UAE",
    });
    fields.push({
      fieldName: "HS Code",
      // Discrepancy point in demo: 030616 instead of 030617
      rawValue: "030616",
      normalizedValue: "030616",
      confidence: 98,
      pageNumber: 2,
      snippet: "RITC CODE: 03061600 (COLD WATER SHRIMPS AND PRAWNS)",
    });
    fields.push({
      fieldName: "Quantity",
      rawValue: "1,200 cartons",
      normalizedValue: "1200",
      confidence: 97,
      pageNumber: 1,
      snippet: "NO OF PACKAGES: 1200 CTN",
    });
    fields.push({
      fieldName: "Net Weight",
      rawValue: "12,000 KG",
      normalizedValue: "12000",
      confidence: 98,
      pageNumber: 1,
      snippet: "NET WT: 12000.00 KGS",
    });
    fields.push({
      fieldName: "Port",
      rawValue: "INCOK",
      normalizedValue: "INCOK",
      confidence: 98,
      pageNumber: 1,
      snippet: "PORT OF LOADING: COCHIN SEA (INCOK1)",
    });
    fields.push({
      fieldName: "Destination",
      rawValue: "AEJEA",
      normalizedValue: "JEBEL ALI, UAE",
      confidence: 97,
      pageNumber: 1,
      snippet: "PORT OF DISCHARGE: JEBEL ALI (AEJEA)",
    });
  }

  // 4. Quality Certificate
  else if (documentType === "Quality Certificate") {
    fields.push({
      fieldName: "Certificate Number",
      rawValue: "EIC/KL/2026/0912",
      normalizedValue: "EIC/KL/2026/0912",
      confidence: 95,
      pageNumber: 1,
      snippet: "CERTIFICATE NO: EIC/KL/2026/0912",
    });
    fields.push({
      fieldName: "Certificate Expiry",
      // Warning point in demo
      rawValue: "18 Oct 2026",
      normalizedValue: "2026-10-18",
      confidence: 91,
      pageNumber: 1,
      snippet: "DATE OF ISSUE: 19-SEP-2026 | VALID UNTIL: 18-OCT-2026",
    });
    fields.push({
      fieldName: "Product",
      rawValue: "Frozen Shrimp 21/25",
      normalizedValue: "FROZEN SHRIMP 21/25",
      confidence: 94,
      pageNumber: 1,
      snippet: "COMMODITY: FROZEN PRAWNS / SHRIMPS GRADE 21/25",
    });
  }

  // 5. Purchase Order
  else if (documentType === "Purchase Order") {
    fields.push({
      fieldName: "PO Number",
      rawValue: "PO-GFT-2291",
      normalizedValue: "PO-GFT-2291",
      confidence: 98,
      pageNumber: 1,
      snippet: "ORDER NO: PO-GFT-2291 | DATED: 01-OCT-2026",
    });
    fields.push({
      fieldName: "Quantity",
      rawValue: "1,200 cartons",
      normalizedValue: "1200",
      confidence: 98,
      pageNumber: 1,
      snippet: "ITEM 1: 1,200 CARTONS @ USD 155.33 / CTN",
    });
    fields.push({
      fieldName: "Total Value",
      rawValue: "USD 186,400",
      normalizedValue: "186400",
      confidence: 99,
      pageNumber: 1,
      snippet: "TOTAL PURCHASE VALUE: USD 186,400.00",
    });
  }

  return fields;
}
