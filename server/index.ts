import express from "express";
import cors from "cors";
import path from "node:path";
import dotenv from "dotenv";
import { shipmentsRouter } from "./routes/shipments";
import { documentsRouter } from "./routes/documents";
import { verificationRouter } from "./routes/verification";
import { assistantRouter } from "./routes/assistant";
import { insightsRouter } from "./routes/insights";
import { publicVerifyRouter } from "./routes/publicVerify";
import { authRouter } from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Global Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads directory
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "VERIFAI Backend Engine",
    timestamp: new Date().toISOString(),
    mode: process.env.DATABASE_URL ? "LIVE" : "DEMO",
  });
});

// Register Routers
app.use("/api/auth", authRouter);
app.use("/api/shipments", shipmentsRouter);
app.use("/api", documentsRouter);
app.use("/api", verificationRouter);
app.use("/api", assistantRouter);
app.use("/api/insights", insightsRouter);
app.use("/api", publicVerifyRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`[VERIFAI Engine] running at http://localhost:${PORT}`);
  console.log(`[Mode] ${process.env.DATABASE_URL ? "LIVE (PostgreSQL)" : "DEMO (In-Memory / Local Cache)"}`);
});

export default app;
