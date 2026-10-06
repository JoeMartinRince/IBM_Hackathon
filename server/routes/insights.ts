import { Router, Request, Response } from "express";

export const insightsRouter = Router();

// GET /api/insights - Kerala Export Intelligence data
insightsRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      issues: [
        { name: "Weight mismatch", value: 32 },
        { name: "HS Code mismatch", value: 24 },
        { name: "Missing certificate", value: 18 },
        { name: "Quantity mismatch", value: 15 },
        { name: "Other compliance", value: 11 },
      ],
      commodities: [
        { name: "Seafood (Cochin)", value: 38 },
        { name: "Spices (Wayanad/Idukki)", value: 27 },
        { name: "Rubber (Kottayam)", value: 19 },
        { name: "Agriculture / Coir (Alappuzha)", value: 16 },
      ],
      readiness: [
        { m: "May", v: 62 },
        { m: "Jun", v: 66 },
        { m: "Jul", v: 71 },
        { m: "Aug", v: 74 },
        { m: "Sep", v: 79 },
        { m: "Oct", v: 84 },
      ],
      ports: [
        { port: "Cochin Sea (INCOK)", issues: 142, ready: 81, shipments: 124 },
        { port: "Vizhinjam Transshipment (INVIZ)", issues: 38, ready: 88, shipments: 46 },
      ],
      average_clearance_saved_hours: 4.2,
      total_docs_processed: 186,
    },
  });
});
