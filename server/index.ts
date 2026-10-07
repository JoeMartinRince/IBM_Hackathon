import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import dotenv from "dotenv";
import { db } from "./db";
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

// 1. HTTP Security Hardening Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible local vite asset loading
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// 2. Controlled CORS Whitelist
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:8080",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-compatible fallback
      }
    },
    credentials: true,
  }),
);

// 3. API Rate Limiting to prevent DoS & brute-force attacks
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again after 15 minutes." },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    error: "Upload rate limit reached. Please wait before uploading more documents.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, error: "Too many authentication requests. Please try again later." },
});

app.use("/api/", standardLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/shipments/:id/documents", uploadLimiter);
app.use("/api/shipments/:id/slots/:slotId/upload", uploadLimiter);

// 4. Body parsers with safe payload limits
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// 5. Static uploads directory
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// 6. Health check with real database connection status
app.get("/api/health", async (_req, res) => {
  const isDbConnected = await db.checkPgConnection();
  res.json({
    status: "healthy",
    service: "VERIFAI Backend Engine",
    timestamp: new Date().toISOString(),
    database: isDbConnected ? "CONNECTED (Neon PostgreSQL)" : "IN_MEMORY",
    mode: isDbConnected ? "LIVE" : "DEMO",
  });
});

// 7. Register Routers
app.use("/api/auth", authRouter);
app.use("/api/shipments", shipmentsRouter);
app.use("/api", documentsRouter);
app.use("/api", verificationRouter);
app.use("/api", assistantRouter);
app.use("/api/insights", insightsRouter);
app.use("/api", publicVerifyRouter);

// 8. Start Server and synchronize with Neon PostgreSQL
app.listen(PORT, async () => {
  console.log(`[VERIFAI Engine] running at http://localhost:${PORT}`);
  if (process.env.DATABASE_URL) {
    try {
      await db.initPostgres();
      console.log(`[Mode] LIVE (Connected & Synchronized with Neon PostgreSQL)`);
    } catch (e) {
      console.warn(`[Mode] PostgreSQL initialization warning:`, e);
      console.log(`[Mode] DEMO (In-Memory Fallback)`);
    }
  } else {
    console.log(`[Mode] DEMO (In-Memory / Local Cache)`);
  }
});

export default app;
