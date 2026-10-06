import { Router, Request, Response } from "express";
import { db } from "../db";

export const publicVerifyRouter = Router();

// GET /api/verify-status/:token - Public safe verification details (no trade prices / bank details)
publicVerifyRouter.get("/verify-status/:token", (req: Request, res: Response) => {
  const tokenRecord = db.verificationTokens.get(req.params.token);
  if (!tokenRecord) {
    return res.status(404).json({
      success: false,
      error: "Verification token invalid or expired",
    });
  }

  const shipment = db.shipments.get(tokenRecord.shipment_id);
  const docsCount = Array.from(db.documents.values()).filter(
    (d) => d.shipment_id === tokenRecord.shipment_id
  ).length;

  res.json({
    success: true,
    verification: {
      token: tokenRecord.token,
      shipment_id: tokenRecord.shipment_id,
      commodity: tokenRecord.commodity,
      exporter: tokenRecord.exporter,
      destination_port: tokenRecord.destination,
      readiness_score: tokenRecord.readiness_score,
      status: tokenRecord.status,
      verified_at: tokenRecord.verified_at,
      expires_at: tokenRecord.expires_at,
      documents_verified_count: docsCount,
      integrity_seal: "VERIFAI-AUTHENTICATED-EXPORT-RECORD",
      security_notice: "Commercial contract values and financial records are redacted for public verification.",
    },
  });
});
