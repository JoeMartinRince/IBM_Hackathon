import { Router, Request, Response } from "express";
import { answerShipmentQuery } from "../engine/assistant";

export const assistantRouter = Router();

// POST /api/shipments/:id/assistant - Ask Your Shipment Q&A (Powered by Gemini AI + Grounded Fallback)
assistantRouter.post("/shipments/:id/assistant", async (req: Request, res: Response) => {
  const { question, api_key } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ success: false, error: "Question string required" });
  }

  const clientKey = (api_key || req.headers["x-gemini-api-key"] || "").toString();

  try {
    const result = await answerShipmentQuery(req.params.id, question, clientKey);
    res.json({
      success: true,
      shipment_id: req.params.id,
      question,
      answer: result.answer,
      citations: result.citations,
      model: result.model,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || "Failed to process query",
    });
  }
});

// POST /api/assistant/test-key - Validate Gemini API Key
assistantRouter.post("/assistant/test-key", async (req: Request, res: Response) => {
  const apiKey = (req.body.api_key || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "").toString().trim();
  if (!apiKey) {
    return res.status(400).json({ success: false, error: "No API key provided" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Respond with the word PONG if you receive this." }] }],
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return res.status(400).json({
        success: false,
        error: errJson.error?.message || `Google API returned status ${response.status}`,
      });
    }

    const data = (await response.json()) as any;
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    res.json({
      success: true,
      valid: true,
      model: "gemini-1.5-flash",
      message: "Gemini API key is active and responding successfully!",
      reply,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || "Network error connecting to Google Generative Language API",
    });
  }
});
