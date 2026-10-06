# VERIFEX AI — Verify Every Export Before It Ships

### AI-Powered Export Document Verification & Trade Readiness Platform
**IBM x Government of Kerala — KeralAI Hackathon 2026**  
**Challenge 3**: Export Document Verification System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TanStack](https://img.shields.io/badge/TanStack-Start%20%26%20Router-orange.svg)](https://tanstack.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-Backend%20API-lightgrey.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Vitest-13%20Passed-brightgreen.svg)](https://vitest.dev/)

---

## 1. Executive Summary & Kerala Trade Context

Kerala's maritime export economy—anchored by the historical **Cochin Sea Port (INCOK)** and the world-class deepwater **Vizhinjam International Transshipment Terminal (INVIZ)**—processes billions in high-value exports annually:
- **Marine Products & Frozen Seafood** (MPEDA regulated, Cochin)
- **Spices & Cardamom** (Spices Board regulated, Wayanad / Idukki)
- **Natural Rubber & Latex** (Rubber Board, Kottayam)
- **Coir Mats & Geotextiles** (Coir Board, Alappuzha)
- **Orthodox & CTC Tea** (Tea Board, High Ranges)

Despite strong global demand, exporters face severe shipment holds, demurrages (₹15,000–₹50,000/container/day), and foreign customs rejections due to minute discrepancies across paperwork:
- Harmonized System (HS) code classification mismatches between Commercial Invoices and ICEGATE Shipping Bills
- Unit of measure inconsistencies (Metric Ton vs Kilogram vs Carton count)
- Expired statutory health and phytosanitary certificates
- Invalid container check digits under ISO 6346 standards

**VERIFEX AI** solves this critical trade bottleneck by cross-verifying all trade paperwork before port gate arrival, establishing a consensus **Golden Record**, predicting customs objections with drafted rebuttals, and generating tamper-evident **Verified QR Codes**.

---

## 2. Key Platform Features

### 🔍 1. Deterministic Multi-Document Verification
- Cross-references Commercial Invoices, Packing Lists, Shipping Bills, Bills of Lading, Purchase Orders, and Inspection Certificates.
- Normalizes weights, carton counts, and pricing across currencies and metric units.
- Validates **ISO 6346 Container Check Digits** with the standard power-of-two modulus algorithm.
- Enforces physical plausibility: Gross Weight $\ge$ Net Weight + Tare Weight.
- Validates trade chronology: PO Date $\le$ Invoice Date $\le$ Shipping Bill Date $\le$ Gate Entry.

### 🏛️ 2. Consensus Golden Record Engine
- Ingests multiple inconsistent documents and synthesizes an authoritative single source of truth.
- Applies weighted source hierarchy: Shipping Bill ($0.95$) $>$ Invoice ($0.90$) $>$ Packing List ($0.85$) $>$ BL ($0.85$) $>$ PO ($0.70$).
- Visualizes consensus values, confidence scores, and conflicting fields with 1-click human override.

### ⚖️ 3. Customs Query & Risk Simulator
- Simulates statutory scrutiny by Indian Customs (ICEGATE) and foreign port authorities (US FDA, EU TRACES, UAE MoIAT).
- Calculates risk likelihood percentages and generates formal, regulation-grounded statutory rebuttal drafts.

### 🎯 4. 1-Click Discrepancy Resolution & Re-Verification
- Interactive comparison matrix highlighting discrepancies with exact document evidence citations.
- 1-Click automated reconciliation with complete audit logging (user name, role, and timestamp).
- Instant re-verification recalculating the **Readiness Score ($0 - 100\%$)**.

### 📱 5. Verified QR Code & Public Audit Portal
- Shipments reaching $100\%$ readiness unlock a cryptographic verification token.
- Port gate officials, ocean carriers, and customs officers can scan the tamper-evident QR code to access the real-time public verification portal (`/verify-status/:token`).

### 🤖 6. Grounded Natural Language Assistant
- Context-aware trade compliance assistant grounded strictly in the shipment's verified records.
- Provides factual answers regarding weights, container details, consignees, and statutory rules with explicit document citations.

### 🌐 7. Multilingual Interface
- Seamless one-click localization into **English**, **Malayalam (മലയാളം)**, and **Hindi (हिन्दी)** tailored for Kerala logistics operators and customs house agents.

---

## 3. Technology Stack

- **Frontend & Full-Stack Routing**: [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router) with React 19 and TypeScript.
- **Styling & UI Tokens**: Tailwind CSS v4, Lucide Icons, Radix UI Primitives, Framer Motion animations.
- **Backend Services**: Express.js REST API with Multer multipart streaming and Zod validation.
- **Document Processing**: `pdf-parse` (PDF streams), `xlsx` (Excel sheets), `mammoth` (Word documents), `tesseract.js` (OCR).
- **Data Layer**: Dual-mode storage (Resilient in-memory/cache store pre-seeded with authentic Kerala shipments + PostgreSQL relational schema).
- **Testing**: Vitest with unit tests covering the verification engine and application routing.

---

## 4. Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Quick Installation

1. Clone or open the repository:
   ```bash
   cd "IBM Hackathon"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```
   *(Note: VERIFEX AI operates automatically in resilient offline DEMO MODE if no external database or AI credentials are supplied).*

4. Launch both Backend API (port 3001) and Frontend Web App (port 8080):
   ```bash
   npm run dev:all
   ```
   Or launch individually in separate terminals:
   ```bash
   # Terminal 1: Backend API Server
   npm run dev:server

   # Terminal 2: Frontend Web App
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## 5. Running Tests

VERIFEX AI includes a comprehensive test suite validating all verification algorithms, container checksums, unit conversions, and route trees:

```bash
npm test
```

All 13 unit and routing tests execute cleanly in under 2 seconds:
- ✅ Unit of measure normalization (MT, KG, LBS)
- ✅ ISO 6346 Container Number checksum validation (MSKU, CSQU)
- ✅ Physical weight invariant enforcement (Gross $\ge$ Net)
- ✅ Export chronology date order validation
- ✅ Discrepancy penalty and readiness score calculation
- ✅ Golden Record priority hierarchy and consensus scoring
- ✅ Application route tree rendering

---

## 6. End-to-End Evaluation Walkthrough (25 Steps)

Follow this guided workflow to evaluate the full capabilities of VERIFEX AI:

1. **Visit Landing Page** (`/`): Inspect the Kerala export value proposition and system statistics.
2. **Access Dashboard** (`/dashboard`): Observe active shipments from Cochin (INCOK) and Vizhinjam (INVIZ).
3. **Inspect Active Shipment**: Select shipment `EXP-KL-2026-1042` (Malabar Ocean Foods — Frozen Shrimp to UAE).
4. **Notice Readiness Score**: Observe current readiness at **68%** with 3 flagged discrepancies.
5. **Navigate to Verify** (`/verify`): Inspect the multi-format file upload dropzone.
6. **Classify Documents**: View the 5 ingested trade documents automatically classified with confidence scores.
7. **Navigate to Verification Results** (`/results`): Inspect the side-by-side Cross-Document Comparison Matrix.
8. **Inspect Discrepancy #1 (Carton Count)**: Observe Commercial Invoice (1,200 cartons) vs Packing List (1,180 cartons).
9. **Click "Inspect Evidence"**: Review exact line item citations from both documents.
10. **Click "Apply 1-Click Fix"**: Accept the reconciled 1,200 cartons with recorded audit log.
11. **Inspect Discrepancy #2 (HS Code)**: Observe Invoice stating `0306.17` while Shipping Bill specifies `0306.16`.
12. **Click "Apply 1-Click Fix"**: Align to authoritative MPEDA catch certificate tariff line `0306.17.90`.
13. **Inspect Discrepancy #3 (Phytosanitary Cert Expiry)**: Resolve the certificate renewal status.
14. **Click "Re-Verify Shipment"**: Watch the verification engine re-compute to **100% Readiness**.
15. **Navigate to Golden Record** (`/golden-record`): Review the single source of truth across all 17 normalized trade fields.
16. **Navigate to Customs Simulator** (`/customs`): Observe that Customs Risk has dropped from High (78%) to Minimal (12%).
17. **Review Statutory Rebuttal**: Inspect the pre-drafted customs response quoting DGFT foreign trade policy.
18. **Navigate to Readiness Checklist** (`/readiness`): Inspect the 10-point compliance criteria all marked **PASS**.
19. **View Verified QR Card**: Observe the cryptographic badge indicating verified status.
20. **Click "View Public Verification Portal"** (`/verify-status/vfx_token_kl2026_1042_verified`): Inspect the public audit view.
21. **Navigate to Export Certificate** (`/report`): Preview the official verification certificate ready for printing or PDF export.
22. **Ask the Natural Language Assistant** (`/assistant`): Ask *"What is the container number and net weight?"* and observe grounded response with citations.
23. **Switch Language**: Use the top bar switcher to view the entire platform in **Malayalam (മലയാളം)** or **Hindi (हिन्दी)**.
24. **Navigate to Shipments Directory** (`/shipments`): Filter Kerala shipments by category (Seafood, Spices, Coir, Rubber, Tea).
25. **Review Kerala Intelligence** (`/insights`): Explore compliance analytics comparing Cochin Port vs Vizhinjam Terminal.

---

## 7. Project Documentation

Detailed architecture specifications are available in the `docs/` folder:
- [System Architecture](file:///e:/Downloads%202/IBM%20Hackathon/docs/ARCHITECTURE.md) (`docs/ARCHITECTURE.md`)
- [REST API Reference](file:///e:/Downloads%202/IBM%20Hackathon/docs/API.md) (`docs/API.md`)
- [Database Schema & Persistence](file:///e:/Downloads%202/IBM%20Hackathon/docs/DATABASE.md) (`docs/DATABASE.md`)

---

## 8. License & Acknowledgements

Developed for the **IBM x Government of Kerala — KeralAI Hackathon 2026**.  
*Challenge 3: Export Document Verification System.*
