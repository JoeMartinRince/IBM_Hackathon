import { Router, Request, Response } from "express";
import { answerShipmentQuery } from "../engine/assistant";

export const assistantRouter = Router();

// POST /api/shipments/:id/assistant - Ask Your Shipment Q&A
assistantRouter.post("/shipments/:id/assistant", (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ success: false, error: "Question string required" });
  }

  const result = answerShipmentQuery(req.params.id, question);
  res.json({
    success: true,
    shipment_id: req.params.id,
    question,
    answer: result.answer,
    citations: result.citations,
  });
});
