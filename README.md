# ⚓ VERIFAI — Verify Every Export Before It Ships

<div align="center">

### AI-Powered Export Document Verification, Discrepancy Prevention & Customs Readiness Platform
**IBM x Government of Kerala — KeralAI Hackathon 2026**  
**Challenge 3**: Export Document Verification System

[![Hackathon](https://img.shields.io/badge/IBM%20x%20Govt%20of%20Kerala-KeralAI%20Hackathon%202026-0043CE?style=for-the-badge&logo=ibm&logoColor=white)](https://github.com/alwinjosegeorge/027_03)
[![Challenge](https://img.shields.io/badge/Challenge%203-Export%20Document%20Verification-059669?style=for-the-badge)](https://github.com/alwinjosegeorge/027_03)

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20%26%20Router-FF4154?style=flat-square&logo=tanstack&logoColor=white)](https://tanstack.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-Backend%20API-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-13%2F13%20Passing%20(100%25)-4E9F3D?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Multilingual](https://img.shields.io/badge/Languages-EN%20%7C%20%E0%B4%AE%E0%B4%B2%E0%B4%AF%E0%B4%BE%E0%B4%B3%E0%B4%82%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-coral?style=flat-square)](#-multilingual-support)

</div>

---

## 📑 Table of Contents

1. [Executive Summary & The Kerala Export Challenge](#-executive-summary--the-kerala-export-challenge)
2. [Why VERIFAI? (The Problem vs The Solution)](#-why-verifai-the-problem-vs-the-solution)
3. [Key Innovations & Platform Capabilities](#-key-innovations--platform-capabilities)
4. [System Architecture](#-system-architecture)
5. [Deterministic Verification Engine Rules](#-deterministic-verification-engine-rules)
6. [Consensus Golden Record Model](#-consensus-golden-record-model)
7. [Customs Query & Risk Simulator](#-customs-query--risk-simulator)
8. [Verified QR & Public Audit Portal](#-verified-qr--public-audit-portal)
9. [Multilingual Support (മലയാളം / हिन्दी / EN)](#-multilingual-support)
10. [Comparison Matrix](#-comparison-matrix)
11. [Technology Stack](#-technology-stack)
12. [Quickstart & Installation](#-quickstart--installation)
13. [Dual-Mode Architecture (Demo Mode vs Live Mode)](#-dual-mode-architecture)
14. [Automated Test Suite](#-automated-test-suite)
15. [25-Step Guided Judge Evaluation Walkthrough](#-25-step-guided-judge-evaluation-walkthrough)
16. [Repository Structure](#-repository-structure)
17. [Hackathon Credits & Submission Metadata](#-hackathon-credits--submission-metadata)

---

## 🌊 Executive Summary & The Kerala Export Challenge

Kerala's maritime trade corridors—anchored by the historical **Cochin Sea Port (INCOK)** and the newly commissioned deepwater **Vizhinjam International Transshipment Terminal (INVIZ)**—form India's primary gateway for high-value agricultural, maritime, and plantation exports:

- 🦐 **Marine Products & Frozen Seafood** (*MPEDA regulated*, Cochin Port)
- 🌿 **Alleppey Green Cardamom & Malabar Pepper** (*Spices Board*, Wayanad / Idukki)
- 🪵 **Natural Rubber & Centrifuged Latex** (*Rubber Board*, Kottayam)
- 🥥 **Coir Pith & Geotextiles** (*Coir Board*, Alappuzha)
- 🍃 **Orthodox & CTC Tea** (*Tea Board*, Munnar / High Ranges)

### The Problem: Multi-Document Asynchrony & Port Rejections
Export documentation involves at least **5 to 7 independent trade documents** created by disparate parties (exporters, clearing agents, freight forwarders, inspection agencies, and banks). 

Even minute discrepancies result in catastrophic supply chain penalties:
- **Demurrage & Container Detention**: ₹15,000 to ₹50,000 per refrigerated container per day at port gates.
- **ICEGATE Customs Holds**: 4 to 8 days delay while statutory queries are issued and answered.
- **Foreign Port Rejections**: Total cargo rejection at destination ports (Jebel Ali, Rotterdam, Newark) due to mismatching HS codes or expired health certificates.
- **Manual Overhead**: Logistics officers spend 3 to 5 hours per consignment manually cross-checking hundreds of numbers across PDF scans and paper prints.

**VERIFAI** solves this critical bottleneck by providing an **automated, deterministic cross-document verification engine** that eliminates errors before cargo departs the factory gate.

---

## ⚖️ Why VERIFAI? (The Problem vs The Solution)

```
TRADITIONAL MANUAL PROCESS
  Exporter CI        Packing List       Shipping Bill      Health Cert
      │                   │                   │                 │
      └─────────┬─────────┴─────────┬─────────┴─────────────────┘
                │
                ▼
        [Manual Check by CHA Officer: 3–5 Hours]
        - Human fatigue leads to overlooked carton differences
        - Typo in container check digit missed
        - Unit mismatch (Metric Ton vs KG) unnoticed
                │
                ▼
      Port Gate Entry Rejected ❌ ──> ICEGATE Query ──> ₹45,000 Demurrage

─────────────────────────────────────────────────────────────────────────────

VERIFAI PLATFORM
  Exporter CI        Packing List       Shipping Bill      Health Cert
      │                   │                   │                 │
      └─────────┬─────────┴─────────┬─────────┴─────────────────┘
                │
                ▼
       [VERIFAI Ingestion & Verification Engine: < 3 Seconds]
       ✓ Deterministic cross-document field alignment
       ✓ ISO 6346 Container checksum validation
       ✓ Consensus Golden Record synthesized
       ✓ Customs queries simulated with statutory rebuttal drafts
       ✓ 1-Click fix with full officer audit trail
                │
                ▼
      100% Readiness Certificate & Verified QR Code Issued ✅
      Expedited Green Channel Clearance at Cochin & Vizhinjam
```

---

## 🚀 Key Innovations & Platform Capabilities

### 1. Deterministic Multi-Document Verification
- Concurrently cross-verifies **Commercial Invoice (CI)**, **Packing List (PL)**, **Shipping Bill (SB)**, **Bill of Lading (BL)**, **Purchase Order (PO)**, and **Phytosanitary/Health Certificates**.
- Enforces strict mathematical invariants rather than relying on error-prone heuristic guesses.

### 2. ISO 6346 Container Number Checksum Engine
- Evaluates the mathematical validity of container serials (e.g. `CSQU3054383`, `MSKU4829150`) using the power-of-two modulus algorithm before the truck arrives at the terminal gate.

### 3. Consensus Golden Record Engine
- Ingests multiple contradictory documents and deterministically builds an authoritative single source of truth using a weighted hierarchical priority model ($SB > CI > PL > BL > PO$).
- Highlights contested fields with side-by-side evidence cards and allows 1-click human reconciliation with audit trail logging.

### 4. Customs Query & Risk Simulator
- Predicts statutory customs queries before ICEGATE submission.
- Formulates pre-drafted legal rebuttals referencing Indian Foreign Trade Policy (FTP) and destination import standards (US FDA, EU TRACES, UAE MoIAT).

### 5. Verified QR Code & Public Audit Portal
- Shipments reaching 100% readiness generate a tamper-evident cryptographic verification token.
- Port gate officials and ocean carriers scan the physical QR code to open the real-time public verification portal (`/verify-status/:token`).

### 6. Grounded Natural Language Assistant
- Context-aware trade compliance assistant grounded strictly in the active shipment's parsed paperwork.
- Cites specific document names, invoice numbers, and page references in every answer.

### 7. Kerala Maritime Trade Intelligence
- Dedicated benchmarking dashboard comparing documentation compliance, gate clearance times, and common error categories across Cochin Sea Port (INCOK) and Vizhinjam Terminal (INVIZ).

### 8. Native Multilingual Support
- Instant one-click interface switching between **English**, **Malayalam (മലയാളം)**, and **Hindi (हिन्दी)**.

### 9. Real-Time Optical Camera Scanner (ക്യാമറ സ്കാനർ)
- Live camera stream integration for on-site warehouse and port gate paper document inspection.
- Holographic viewfinder overlay with animated laser scanning beam, document corner framing brackets, torch toggle, and synthetic camera shutter feedback.

---

## 🏗️ System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER                                   |
|             React 19 / TanStack Start / TypeScript / Tailwind CSS v4 / Lucide         |
|                                                                                       |
|  - AppShell Layout (Responsive Sidebar + Mobile Floating Dock)                        |
|  - Multilingual Engine (English, Malayalam, Hindi)                                    |
|  - Dropzone Ingestion Interface (/verify)                                             |
|  - Cross-Document Discrepancy Matrix & 1-Click Resolution (/results)                   |
|  - Consensus Golden Record Board (/golden-record)                                     |
|  - Customs Query Simulator (/customs)                                                 |
|  - 10-Point Export Readiness Checklist & QR Badge (/readiness)                        |
|  - Official Printable Verification Certificate (/report)                             |
|  - Kerala Maritime Intelligence Analytics (/insights)                                |
|  - Grounded Trade Assistant with Document Citations (/assistant)                     |
|  - Public QR Code Verification Portal (/verify-status/:token)                         |
+-------------------------------------------+-------------------------------------------+
                                            |
                              Vite Reverse Proxy (/api -> :3001)
                                            |
+-------------------------------------------v-------------------------------------------+
|                                      API GATEWAY                                      |
|                       Express.js / TypeScript / RESTful Routers                       |
|                                                                                       |
|  - /api/shipments          - /api/documents          - /api/verification             |
|  - /api/golden-record      - /api/customs-risk       - /api/assistant                |
|  - /api/insights           - /api/verify-status/:tok - /api/health                   |
+-------------------------------------------+-------------------------------------------+
                                            |
         +----------------------------------+----------------------------------+
         |                                                                     |
+--------v---------------------------------+                 +-----------------v--------+
|       DOCUMENT INGESTION PIPELINE        |                 |   VERIFICATION & AI ENGINE   |
|                                          |                 |                          |
| 1. Classification Engine:                |                 | 1. Deterministic Engine: |
|    - Weighted keyword & layout scoring   |                 |    - Unit normalization  |
|    - 7 Export document archetypes        |                 |    - ISO 6346 checksum   |
|                                          |                 |    - Weight invariants   |
| 2. Multi-Format Parsers:                 |                 |    - Date chronology     |
|    - PDF Stream Parser (pdf-parse)       |                 |    - Currency conversion |
|    - Excel Sheet Parser (xlsx)           |                 |                          |
|    - Word Doc Parser (mammoth)           |                 | 2. Golden Record Engine: |
|    - OCR Engine (tesseract.js)           |                 |    - Weighted consensus  |
|                                          |                 |    - Audit trail logging |
| 3. Structured Data Extractor:            |                 |                          |
|    - Normalized JSON schema output       |                 | 3. Customs Simulator:    |
|    - Field confidence scoring            |                 |    - Statutory rulebase  |
|    - Bounding-box & page tracking        |                 |    - Notice generation   |
+------------------------------------------+                 |                          |
                                                             | 4. Assistant Grounding:  |
                                                             |    - Grounded Q&A        |
                                                             |    - Source citations    |
                                                             +-----------------+--------+
                                                                               |
+------------------------------------------------------------------------------v--------+
|                                    PERSISTENCE LAYER                                  |
|                                                                                       |
|  - Dual Mode Architecture:                                                            |
|    * Live Mode: PostgreSQL relational schema (server/schema.sql)                      |
|    * Demo Mode: Resilient high-speed in-memory store pre-seeded with authentic        |
|      Kerala maritime export consignments (server/db.ts)                               |
+---------------------------------------------------------------------------------------+
```

---

## 🔍 Deterministic Verification Engine Rules

The verification engine (`server/engine/verification.ts`) evaluates every shipment against 5 fundamental statutory invariants:

### 1. Unit Normalization & Tolerance Checks
Converts non-standard measures to base metric units:
$$\text{MT} \times 1,000 \rightarrow \text{KG}, \quad \text{LBS} \times 0.45359237 \rightarrow \text{KG}$$
Any variation between Commercial Invoice and Packing List exceeding $0.05\%$ is flagged as a `MAJOR` discrepancy.

### 2. ISO 6346 Container Number Modulus Algorithm
Containers are verified according to standard ISO 6346 check digit formulation:
$$\text{Check Digit} = \left( \sum_{i=0}^{9} c_i \cdot 2^i \right) \pmod{11} \pmod{10}$$
Where each letter is assigned an integer excluding multiples of 11:
`A=10, B=12... K=21... U=32, Z=38`. Invalid codes are immediately flagged before terminal gate entry.

### 3. Physical Weight Invariant
Enforces the physical plausibility rule:
$$\text{Gross Weight} \ge \text{Net Weight} + \text{Tare Weight}$$
Any document where Gross Weight is recorded as less than Net Weight is flagged as a `CRITICAL` compliance violation.

### 4. Trade Chronology Sequence
Verifies logical commercial timeline ordering:
$$\text{Purchase Order Date} \le \text{Commercial Invoice Date} \le \text{Shipping Bill Date} \le \text{Bill of Lading Date}$$
Backdated invoices or expired regulatory inspection certificates trigger immediate warning notices.

### 5. Tariff Line & HS Code Alignment
Validates 6-to-8 digit Harmonized System classification consistency across all trade instruments, preventing custom misdeclaration penalties under Section 111(m) of the Indian Customs Act.

---

## 🏛️ Consensus Golden Record Model

When different trade documents contain conflicting data, VERIFAI builds an authoritative **Golden Record** using a weighted authority hierarchy:

| Document Type | Authority Weight | Statutory Rationale |
| :--- | :---: | :--- |
| **Shipping Bill (SB)** | `0.95` | Legal export declaration filed with Indian Customs / ICEGATE |
| **Commercial Invoice (CI)** | `0.90` | Primary financial and contractual billing instrument |
| **Packing List (PL)** | `0.85` | Definitive physical authority for package counts, tare & weights |
| **Bill of Lading (BL)** | `0.85` | Ocean carrier document of title and custody manifest |
| **Purchase Order (PO)** | `0.70` | Original buyer commercial agreement |

If conflicting values exist across documents:
1. The field is tagged `has_conflict = true`.
2. The UI highlights both conflicting values with document badges.
3. The officer can apply a **1-Click Fix** or enter a manual override.
4. Every override is permanently recorded in the immutable audit log (`audit_logs`).

---

## ⚖️ Customs Query & Risk Simulator

Customs holds cost exporters days in lost time. The simulator calculates statutory query risk ($0 - 100\%$) and pre-drafts formal responses:

```
[HIGH RISK SCENARIO DETECTED]
Shipment: EXP-KL-2026-1042 (Frozen Shrimp to Jebel Ali)
Discrepancy: Shipping Bill states HS 030616; Commercial Invoice states HS 030617.
Predicted Customs Query:
  "Discrepancy in declared HS Code between Shipping Bill (030616) and Commercial
   Invoice (030617). Explain tariff variation and produce valid MPEDA certificate."

VERIFAI PRE-DRAFTED REBUTTAL:
  "To: The Assistant Commissioner of Customs (Export), Cochin Customs House (INCOK)
   Subject: Clarification on HS Code Classification for Shipment EXP-KL-2026-1042
   
   Respected Sir/Madam,
   With reference to the query raised regarding tariff line classification, we submit
   that the correct Harmonized Tariff code for 'Frozen Shrimp 21/25 Raw Headless' is
   HS 0306.17.90, as corroborated by MPEDA Catch Certificate #MPEDA-KER-2026-8812.
   The entry in Shipping Bill #SB-9920141 was an inadvertent clerical transposition
   error under Section 149 of the Customs Act, 1962. Amended documentation attached."
```

---

## 📱 Verified QR & Public Audit Portal

When a shipment reaches **100% Readiness**:
1. A unique verification token is minted (e.g. `vfx_token_kl2026_1042_verified`).
2. A tamper-evident QR code is embedded in the official **Verification Certificate** (`/report`).
3. Port gate personnel, freight forwarders, and overseas customs officers can scan the QR code to open the public verification portal (`/verify-status/:token`) showing real-time validation status without requiring login credentials.

---

## 🌐 Multilingual Support

Designed to serve local Kerala clearing agents, logistics personnel, and interstate traders:
- **English**: International trade terminology and standard customs formats.
- **Malayalam (മലയാളം)**: Native terminology for Kerala exporters (e.g., *ഡോക്യുമെന്റ് പരിശോധന, കയറ്റുമതി സന്നദ്ധത, വിഴിഞം ട്രാൻസ്ഷിപ്പ്മെന്റ്*).
- **Hindi (हिन्दी)**: Pan-India customs house agent and freight forwarding terminology.

Switch languages instantly using the globe icon in the navigation bar.

---

## 📊 Comparison Matrix

| Capability | Manual Verification | Generic OCR / Document AI | VERIFAI |
| :--- | :---: | :---: | :---: |
| **Verification Speed** | 3 – 5 hours / shipment | 10 – 15 minutes | **< 3 seconds** |
| **Multi-Document Cross Check** | Manual side-by-side | Single doc extraction only | **Automatic 7-way matrix** |
| **Container Checksum (ISO 6346)** | Rarely checked | ❌ Not supported | **✅ Mathematical validation** |
| **Consensus Golden Record** | Manual spreadsheet | ❌ Not supported | **✅ Weighted hierarchical model** |
| **Customs Query Simulation** | Reactive after penalty | ❌ Not supported | **✅ Pre-departure projection** |
| **Statutory Rebuttal Drafting** | 1 – 2 days legal review | ❌ Not supported | **✅ Pre-drafted regulation citations** |
| **Readiness Scoring** | Subjective opinion | ❌ Not supported | **✅ Deterministic 100% metric** |
| **Public Verified QR Portal** | ❌ None | ❌ None | **✅ Cryptographic public token** |
| **Multilingual UI (മലയാളം/हिन्दी)** | ❌ None | ❌ None | **✅ 1-Click native switching** |

---

## 💻 Technology Stack

### Frontend & Full-Stack Routing
- **Framework**: [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router)
- **UI Library**: [React 19](https://react.dev/) + [TypeScript 5.9](https://www.typescriptlang.org/)
- **Design System**: [Tailwind CSS v4](https://tailwindcss.com/) with semantic design tokens
- **Primitives & Icons**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Data Visualizations**: [Recharts](https://recharts.org/) (maritime intelligence analytics)

### Backend API & Processing Pipeline
- **API Runtime**: [Express.js](https://expressjs.com/) on Node.js
- **Document Parsers**: `pdf-parse` (PDF streams), `xlsx` (Excel sheets), `mammoth` (Word documents), `tesseract.js` (OCR)
- **Validation**: [Zod](https://zod.dev/) schema validation
- **File Uploads**: [Multer](https://github.com/expressjs/multer) streaming handler

### Testing & Verification
- **Test Runner**: [Vitest](https://vitest.dev/) with automated unit tests covering all deterministic algorithms and routing.

---

## ⚡ Quickstart & Installation

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 1. Clone & Install

```bash
git clone https://github.com/alwinjosegeorge/027_03.git
cd "027_03"
npm install
```

### 2. Configure Environment (Optional)

```bash
cp .env.example .env
```

*(Note: VERIFAI operates out of the box in **Resilient Demo Mode** with zero external database or API key requirements).*

### 3. Launch Development Servers

Start both the backend Express server (port 3001) and frontend web app (port 8080) simultaneously with a single command:

```bash
npm run dev:all
```

Or run them in separate terminals if preferred:

```bash
# Terminal 1: Backend API Gateway
npm run dev:server

# Terminal 2: Frontend Web App
npm run dev
```

### 4. Open in Browser

Open your browser and navigate to:
```
http://localhost:8080
```

---

## 🔄 Dual-Mode Architecture

VERIFAI provides seamless dual-mode execution to ensure **100% offline reliability for hackathon evaluation** alongside enterprise production scalability:

| Feature | DEMO MODE (Default) | LIVE MODE (Production) |
| :--- | :--- | :--- |
| **Database** | In-memory store pre-seeded with 6 authentic Kerala shipments | PostgreSQL relational database (`DATABASE_URL`) |
| **Document OCR** | High-speed deterministic fallback parser | Full `tesseract.js` OCR stream extraction |
| **AI Assistant** | Grounded rule-based semantic retriever | Granite-3.2-8b-instruct / LLM Gateway API |
| **External Dependencies** | **Zero external dependencies required** | Cloud database & AI model endpoint |
| **Offline Reliability** | **100% Guaranteed** | Depends on internet connectivity |

*Toggle between Demo and Live mode anytime in `/settings`.*

---

## 🧪 Automated Test Suite

VERIFAI includes comprehensive automated test coverage for all core verification mathematics and routing:

```bash
npm test
```

### Test Results (13/13 Passed)

```
 RUN  v4.1.11 E:/Downloads 2/IBM Hackathon

 ✓ src/test/verification-engine.test.ts (12 tests) 11ms
   ✓ unit normalization: converts MT to KG correctly
   ✓ unit normalization: converts LBS to KG correctly
   ✓ container check digit: validates valid container CSQU3054383
   ✓ container check digit: validates valid container MSKU4829150
   ✓ container check digit: flags invalid check digit
   ✓ container check digit: flags invalid container code structure
   ✓ physical plausibility: flags when gross weight is less than net weight
   ✓ physical plausibility: passes when gross weight exceeds net weight
   ✓ export chronology: flags when invoice is dated before purchase order
   ✓ export chronology: passes valid date sequence
   ✓ readiness score: calculates 100% when no open discrepancies
   ✓ readiness score: penalizes score appropriately for open discrepancies
 ✓ src/test/app-routing.test.tsx (1 test) 13ms
   ✓ renders the application without crashing

 Test Files  2 passed (2)
      Tests  13 passed (13)
   Duration  3.72s
```

---

## 🧭 25-Step Guided Judge Evaluation Walkthrough

Follow this step-by-step workflow to experience the complete platform flow:

| Step | Page / Action | Description |
| :---: | :--- | :--- |
| **1** | `/` (Landing Page) | View executive summary, Kerala export value metrics, and system statistics. |
| **2** | `/dashboard` | Review the operational dashboard monitoring active shipments across Cochin and Vizhinjam. |
| **3** | Active Shipment | Select shipment `EXP-KL-2026-1042` (*Malabar Ocean Foods — Frozen Shrimp to UAE*). |
| **4** | Readiness Ring | Note the current readiness score at **68%** with 3 open compliance issues. |
| **5** | `/verify` | View the drag-and-drop document upload dropzone. |
| **6** | Document Badges | Inspect the 5 ingested trade documents automatically classified with confidence scores. |
| **7** | `/results` | Open the **Cross-Document Comparison Matrix** comparing CI, PL, SB, PO, and Quality Cert. |
| **8** | Discrepancy #1 | Review the carton quantity conflict: Commercial Invoice (1,200) vs Packing List (1,180). |
| **9** | Inspect Evidence | Click **"Inspect Evidence"** to view exact document line citations side-by-side. |
| **10** | Apply 1-Click Fix | Click **"Apply 1-Click Fix"** to reconcile to 1,200 cartons with recorded audit log. |
| **11** | Discrepancy #2 | Inspect the HS Code conflict: Commercial Invoice (`0306.17`) vs Shipping Bill (`0306.16`). |
| **12** | Apply 1-Click Fix | Reconcile the HS code to authoritative MPEDA catch certificate tariff line `0306.17.90`. |
| **13** | Discrepancy #3 | Resolve the expiring health inspection certificate. |
| **14** | Re-Verify Shipment | Click **"Re-Verify Shipment"**; watch the readiness gauge update to **100%**. |
| **15** | `/golden-record` | Review the synthesized single source of truth across all 17 normalized trade fields. |
| **16** | `/customs` | Observe that simulated Customs Risk has plummeted from High (78%) to Low (12%). |
| **17** | Statutory Rebuttal | Review the pre-drafted legal response quoting Section 149 of the Customs Act, 1962. |
| **18** | `/readiness` | Verify the 10-point compliance checklist where all items now show **PASS**. |
| **19** | Verified QR Card | View the cryptographic **Verified QR Code** unlocked at 100% readiness. |
| **20** | `/verify-status/:token` | Click the public link to view the tamper-evident external verification portal. |
| **21** | `/report` | Preview the official printable **Verification Certificate** complete with digital seal. |
| **22** | `/assistant` | Ask *"What is the container number and net weight?"*; observe grounded response with citations. |
| **23** | Language Switcher | Click the globe icon in the top bar to switch the entire application to **മലയാളം (Malayalam)**. |
| **24** | `/shipments` | Explore other Kerala export shipments filtered by Spices, Coir, Rubber, and Tea. |
| **25** | `/insights` | Review maritime analytics comparing compliance trends between Cochin Port and Vizhinjam Terminal. |

---

## 📂 Repository Structure

```
027_03/
├── docs/                                # Technical Architecture Specifications
│   ├── ARCHITECTURE.md                  # Detailed system design & modulus algorithms
│   ├── API.md                           # REST API endpoint documentation
│   └── DATABASE.md                      # PostgreSQL schema & entity-relationship model
├── server/                              # Full-Stack Express.js Backend
│   ├── engine/                          # Deterministic Verification & AI Engines
│   │   ├── verification.ts              # Unit math, ISO 6346 checksum, chronology logic
│   │   ├── goldenRecord.ts              # Weighted hierarchical consensus engine
│   │   ├── customsRisk.ts               # Customs query prediction & statutory rebuttals
│   │   └── assistant.ts                 # Grounded semantic retrieval engine
│   ├── pipeline/                        # Document Processing Pipeline
│   │   ├── classifier.ts                # 7-category document classifier
│   │   ├── parser.ts                    # PDF, XLSX, DOCX, and OCR parsers
│   │   └── extractor.ts                 # Structured field normalization extractor
│   ├── routes/                          # REST API Routers
│   │   ├── shipments.ts                 # Shipment registry & CRUD
│   │   ├── documents.ts                 # File upload & document processing
│   │   ├── verification.ts              # Verification results & discrepancy resolution
│   │   ├── customsRisk.ts               # Customs risk calculations
│   │   ├── assistant.ts                 # Context-grounded assistant
│   │   ├── insights.ts                  # Kerala maritime intelligence data
│   │   ├── publicVerify.ts              # Public QR verification endpoint
│   │   └── auth.ts                      # Persona management & user roles
│   ├── db.ts                            # Dual-mode store (Pre-seeded Kerala dataset)
│   ├── schema.sql                       # PostgreSQL DDL table definitions
│   ├── types.ts                         # Universal TypeScript domain interfaces
│   └── index.ts                         # Express server entry point (Port 3001)
├── src/                                 # Full-Stack Frontend Application
│   ├── components/                      # Modular UI Components
│   │   ├── ui/                          # Radix UI design primitives
│   │   └── verifex/                     # VERIFAI design system components
│   │       ├── AppShell.tsx             # Master layout with sidebar & mobile dock
│   │       ├── primitives.tsx           # ReadinessRing, StatusBadge, StatTile, Reveal
│   │       └── QRCode.tsx               # Verified QR code renderer
│   ├── lib/                             # State Management & Services
│   │   ├── services/api.ts              # Typed API client connecting to backend
│   │   ├── demo-store.tsx               # Reactive store with instant state transitions
│   │   ├── i18n.ts                      # Multilingual dictionary (EN, ML, HI)
│   │   └── data.ts                      # Authentic Kerala maritime baseline data
│   ├── routes/                          # TanStack File-Based Routes
│   │   ├── _app/dashboard.tsx           # Operations dashboard
│   │   ├── _app/verify.tsx              # Multi-document upload & classifier
│   │   ├── _app/results.tsx             # Comparison matrix & 1-click resolution
│   │   ├── _app/golden-record.tsx       # Consensus single source of truth
│   │   ├── _app/customs.tsx             # Customs Query & Risk Simulator
│   │   ├── _app/readiness.tsx           # 10-point checklist & QR verification
│   │   ├── _app/report.tsx              # Printable Verification Certificate
│   │   ├── _app/assistant.tsx           # Grounded trade compliance assistant
│   │   ├── _app/shipments.tsx           # Kerala export shipment directory
│   │   ├── _app/insights.tsx            # Maritime intelligence analytics
│   │   ├── _app/intelligence.tsx        # Export commodity compliance rulebook
│   │   ├── _app/settings.tsx            # Persona switcher & Live/Demo toggle
│   │   ├── verify-status.$token.tsx     # Public QR token external portal
│   │   ├── login.tsx                    # Quick-start persona login
│   │   └── index.tsx                    # Landing page
│   └── test/                            # Automated Vitest Test Suite
│       ├── verification-engine.test.ts  # 12 unit tests for verification algorithms
│       └── app-routing.test.tsx         # Routing tree render test
├── uploads/                             # Document upload storage directory
├── .env.example                         # Environment configuration blueprint
├── package.json                         # Scripts & dependency definitions
├── tsconfig.json                        # Strict TypeScript compiler config
└── vite.config.ts                       # Vite config with TanStack plugin & API proxy
```

---

## 🏆 Hackathon Credits & Submission Metadata

- **Event**: IBM x Government of Kerala — KeralAI Hackathon 2026
- **Challenge**: Challenge 3 — Export Document Verification System
- **Focus Area**: AI-Powered Maritime Trade Compliance for Cochin Sea Port (INCOK) & Vizhinjam Deepwater Terminal (INVIZ)
- **Primary Developer**: Alwin Joseph George ([@alwinjosegeorge](https://github.com/alwinjosegeorge))
- **Repository**: [https://github.com/alwinjosegeorge/027_03](https://github.com/alwinjosegeorge/027_03)

<div align="center">
  <sub>Built with pride for Kerala's global exporters. ⚓ Made for KeralAI Hackathon 2026.</sub>
</div>
