import { Router, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { db } from "../db";
import { DocumentRecord } from "../types";
import { classifyDocument } from "../pipeline/classifier";
import { parseDocument } from "../pipeline/parser";
import { extractStructuredFields } from "../pipeline/extractor";

export const documentsRouter = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|jpe?g|png|xlsx|xls|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Please upload PDF, JPG, PNG, XLSX, or DOCX."));
    }
  },
});

// GET /api/shipments/:id/documents - List documents for shipment
documentsRouter.get("/shipments/:id/documents", (req: Request, res: Response) => {
  const shipmentId = req.params.id;
  const docs = Array.from(db.documents.values()).filter((d) => d.shipment_id === shipmentId);
  res.json({ success: true, count: docs.length, documents: docs });
});

// POST /api/shipments/:id/documents - Upload documents
documentsRouter.post(
  "/shipments/:id/documents",
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    const shipmentId = req.params.id;
    const shipment = db.shipments.get(shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, error: "Shipment not found" });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: "No files uploaded" });
    }

    const createdDocs: DocumentRecord[] = [];

    for (const f of files) {
      const docId = `doc-${Date.now()}-${Math.round(Math.random() * 1000)}`;

      // Initial classification from filename
      const initialClass = classifyDocument(f.originalname, "");

      const docRecord: DocumentRecord = {
        id: docId,
        shipment_id: shipmentId,
        filename: f.originalname,
        file_path: f.path,
        file_size: f.size,
        mime_type: f.mimetype,
        document_type: initialClass.documentType,
        confidence: initialClass.confidence,
        status: "UPLOADED",
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.documents.set(docId, docRecord);
      createdDocs.push(docRecord);

      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        shipment_id: shipmentId,
        user_name: "Alwin Joseph",
        user_role: "Documentation Lead",
        action: "Document Uploaded",
        details: `Uploaded ${f.originalname} (${(f.size / 1024).toFixed(1)} KB) - classified as ${docRecord.document_type}.`,
        created_at: new Date().toISOString(),
      });
    }

    res.status(201).json({ success: true, documents: createdDocs });
  }
);

// POST /api/documents/:id/process - Run OCR, text extraction, classification, and field extraction
documentsRouter.post("/documents/:id/process", async (req: Request, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, error: "Document not found" });
  }

  try {
    doc.status = "EXTRACTING";

    // 1. Parse text from file
    const extractedText = await parseDocument(doc.file_path, doc.mime_type, doc.filename);
    doc.extracted_text = extractedText;

    // 2. Classify document
    const classification = classifyDocument(doc.filename, extractedText);
    doc.document_type = classification.documentType;
    doc.confidence = classification.confidence;

    // 3. Extract structured key-value fields
    const fields = extractStructuredFields(doc.document_type, extractedText, doc.filename);

    // Save fields into DB
    for (const f of fields) {
      const fieldId = `field-${Date.now()}-${Math.round(Math.random() * 10000)}`;
      db.extractedFields.set(fieldId, {
        id: fieldId,
        shipment_id: doc.shipment_id,
        document_id: doc.id,
        field_name: f.fieldName,
        raw_value: f.rawValue,
        normalized_value: f.normalizedValue,
        page_number: f.pageNumber,
        confidence: f.confidence,
        snippet: f.snippet,
        created_at: new Date().toISOString(),
      });
    }

    doc.status = "VERIFIED";
    doc.updated_at = new Date().toISOString();
    db.documents.set(doc.id, doc);

    res.json({
      success: true,
      document: doc,
      extracted_fields: fields,
    });
  } catch (error) {
    console.error("Document processing error:", error);
    doc.status = "FAILED";
    doc.error_message = error instanceof Error ? error.message : "Processing failed";
    db.documents.set(doc.id, doc);
    res.status(500).json({ success: false, error: doc.error_message });
  }
});
