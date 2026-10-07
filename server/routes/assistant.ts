import { Router, Request, Response } from "express";
import { answerShipmentQuery, getAvailableGeminiKeys } from "../engine/assistant";

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

// POST /api/assistant/test-key - Validate Gemini API Key or Pool of Backup Keys
assistantRouter.post("/assistant/test-key", async (req: Request, res: Response) => {
  const rawKey = req.body.api_key ? String(req.body.api_key).trim() : "";
  const candidateKeys = rawKey
    ? rawKey
        .split(/[,;\n\r]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 10)
    : getAvailableGeminiKeys();

  if (candidateKeys.length === 0) {
    return res.status(400).json({ success: false, error: "No API key provided or configured" });
  }

  const testModels = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.5-flash-lite",
    "gemini-pro-latest",
  ];

  const results: Array<{
    index: number;
    type: string;
    key_preview: string;
    status: "ACTIVE" | "FAILED";
    model?: string;
    reply?: string;
    error?: string;
  }> = [];

  let atLeastOneValid = false;
  let activeModel = "gemini-flash-lite-latest";

  for (let idx = 0; idx < candidateKeys.length; idx++) {
    const key = candidateKeys[idx];
    let keyValid = false;
    let keyModel = "";
    let keyReply = "PONG";
    let lastError = "Failed to connect to Google API";

    for (const model of testModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: "Respond with the word PONG if you receive this." }],
              },
            ],
          }),
          signal: AbortSignal.timeout(7000),
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          lastError =
            (errJson as any).error?.message || `Google API returned status ${response.status}`;
          continue;
        }

        const data = (await response.json()) as any;
        keyReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "PONG";
        keyValid = true;
        keyModel = model;
        activeModel = model;
        atLeastOneValid = true;
        break;
      } catch (err: any) {
        lastError = err.message || "Network error connecting to Google Generative Language API";
      }
    }

    if (keyValid) {
      results.push({
        index: idx + 1,
        type: idx === 0 ? "Primary Key" : `Backup Key #${idx}`,
        key_preview: `${key.slice(0, 14)}...`,
        status: "ACTIVE",
        model: keyModel,
        reply: keyReply,
      });
    } else {
      results.push({
        index: idx + 1,
        type: idx === 0 ? "Primary Key" : `Backup Key #${idx}`,
        key_preview: `${key.slice(0, 14)}...`,
        status: "FAILED",
        error: lastError,
      });
    }
  }

  if (atLeastOneValid) {
    const primaryActive = results.find((r) => r.status === "ACTIVE");
    return res.json({
      success: true,
      valid: true,
      model: primaryActive?.model || activeModel,
      message: `Gemini API key is active and responding via ${primaryActive?.model || activeModel}!`,
      reply: primaryActive?.reply || "PONG",
      total_keys: candidateKeys.length,
      active_keys: results.filter((r) => r.status === "ACTIVE").length,
      keys: results,
    });
  }

  res.status(400).json({
    success: false,
    valid: false,
    error: results[0]?.error || "All tested Gemini API keys failed",
    total_keys: candidateKeys.length,
    keys: results,
  });
});
