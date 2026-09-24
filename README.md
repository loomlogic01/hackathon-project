# GeM AI Bid Compliance Verification Platform
> **Automated Statutory, Regulatory & Eligibility Verification Platform for Government e-Marketplace (GeM) Tenders**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.13-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Llama 3.1](https://img.shields.io/badge/Ollama-Llama_3.1:8B-000000.svg?style=flat)](https://ollama.ai)
[![SQLite](https://img.shields.io/badge/SQLite3-Audit_Trail-003B57.svg?style=flat&logo=SQLite&logoColor=white)](https://sqlite.org)

---

## 🏛️ Problem Statement Background

Government procurement through the **Government e-Marketplace (GeM)** involves verification of multiple statutory, regulatory, and eligibility requirements of bidders. Procurement officers are required to examine and validate documents across Udyam/MSME, GSTN, PAN & Income Tax compliance, Past Experience, Financial Turnover, Non-Blacklisting declarations, and OEM authorization.

This platform replaces manual, error-prone verification with an **AI-powered verification pipeline** that cross-checks bidder submissions across statutory portals in seconds, generates an auditable compliance score (0–100), and provides actionable AI decision support while keeping statutory authority with the Procurement Officer.

---

## 🚀 Key Features

1. **AI Document Ingestion & Extraction Engine**:
   - Parses submitted bid documents (PDF) using `pdfplumber` and intelligent regex pattern matching.
   - Extracts Tender Reference IDs, Udyam Registration Numbers, GSTIN, PAN, Years of Experience, Turnover Amount, and Non-Blacklisting Affidavits.

2. **Statutory Multi-Portal Cross-Verification**:
   - Interoperable mock verification for **GSTN** (15-digit GSTIN active status & legal name).
   - Verification for **Udyam MSME** (Enterprise classification: Micro/Small/Medium).
   - Income Tax **PAN** verification (Entity type & active status).

3. **Compliance Scoring & Risk Classification**:
   - **MSME / Udyam Certification** (+20 Pts)
   - **GSTN Active Status & Filing** (+20 Pts)
   - **Experience Criteria** ($\ge 3$ yrs or MSME exemption) (+20 Pts)
   - **Financial Turnover Declaration** (+20 Pts)
   - **Non-Blacklisting & Integrity Affidavit** (+20 Pts)
   - Overall Score Meter: **Compliant** ($\ge 80$), **Partially Compliant** ($50-79$), **Non-Compliant** ($<50$).

4. **Llama 3.1 AI Review Engine**:
   - Plain-English executive review generated for Procurement Officers.
   - Discrepancy detector and extraction accuracy verification.
   - Failsafe fallback engine ensuring 100% demo uptime even if local Ollama daemon is offline.

5. **AI Tender Assistant (Chatbot)**:
   - Interactive conversational assistant with direct bid document context.
   - Prompt suggestions: Draft Clarification Notices under GTC Clause 7.3, check tax compliance, or explain MSME purchase preferences.

6. **Audit Trail & Printable Compliance Certificate**:
   - Every verification check is immutably logged to SQLite (`gembid.db`).
   - One-click exportable / printable official **GeM Compliance Certificate** with GFR 2017 formatting.

7. **Cryptographic Audit Chain & Data Integrity**
   - SHA-256 Document Fingerprinting: Every uploaded tender document is instantly hashed at binary level using SHA-256 upon ingestion to create a unique cryptographic fingerprint.
   - Tamper-Evident Linked Ledger: Each compliance report stores both its current 'file_hash' and the 'previous_file_hash' of the preceding record, establishing an immutable cryptographic chain.
   - Audit Verification Interface: Built-in UI inspect modal ('ReportModal.jsx') and evaluation deck allow procurement officers to review document hashes, verify audit chain continuity, and detect manual database tampering.

---

## 🛠️ Quick Start & Setup

### 1. Launch All Services with One Click
Double click `start-all.bat` or run:
```powershell
.\start-all.bat
```

### 2. Manual Startup

#### Backend (FastAPI - Port 8000)
```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```
- API Root: [http://localhost:8000](http://localhost:8000)
- Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend (React + Vite - Port 5173)
```powershell
cd frontend
npm run dev
```
- Dashboard URL: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Hackathon Pitch & Live Demo Guide

1. **Instant Demo Mode**:
   - Open [http://localhost:5173](http://localhost:5173).
   - In the **Bid Evaluation** tab, click **Sample 1: Compliant Micro-Enterprise** or **Sample 2: Partial Compliance** to immediately showcase the pipeline without manually finding a PDF.
2. **Real PDF Upload Test**:
   - Upload any of the generated sample PDFs located in `backend/sample_bids/`:
     - `Sample_1_Compliant_TechnoCorp.pdf` (100% Compliant + Confetti)
     - `Sample_2_Partial_ApexInfra.pdf` (60% Partially Compliant - Action Required)
     - `Sample_3_NonCompliant_QuickVendor.pdf` (0% Non-Compliant)
3. **Statutory Portal Sandbox**:
   - Navigate to the **Multi-Portal Lookup & Sandbox** tab.
   - Test live GSTIN, Udyam, or PAN queries and test the Prior Experience vs. MSME rule formula calculator.
4. **AI Tender Chat**:
   - Click the **AI Bid Tender Assistant** tab and ask *"Draft a clarification notice to the bidder"* or click any suggested prompt chips.
5. **Audit Trail & Certificate**:
   - Go to **Audit Trail & Records** to view historical evaluations and click **Inspect Certificate** to view and print the official certificate.

---

## 📁 Repository Structure

```
gem-compliance-platform/
├── backend/
│   ├── main.py                  # FastAPI server with CORS, endpoints & AI review
│   ├── database.py              # SQLite schema and audit trail queries
│   ├── generate_samples.py      # Standalone sample PDF generator
│   ├── requirements.txt         # Python dependencies
│   ├── gembid.db                # SQLite database for audit records
│   └── sample_bids/             # Test PDF files for live demo
│       ├── Sample_1_Compliant_TechnoCorp.pdf
│       ├── Sample_2_Partial_ApexInfra.pdf
│       └── Sample_3_NonCompliant_QuickVendor.pdf
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # GeM navbar, tricolor banner & live status
│   │   │   ├── BidEvaluator.jsx        # PDF dropzone, score gauge & officer panel
│   │   │   ├── ScoreGauge.jsx          # Radial animated compliance meter
│   │   │   ├── VerificationPipeline.jsx# 5-stage visual progress tracker
│   │   │   ├── PortalLookup.jsx        # Live GSTN, Udyam, PAN & eligibility sandbox
│   │   │   ├── BidChatbot.jsx          # AI Tender Assistant with prompt chips
│   │   │   ├── AuditHistory.jsx        # Searchable audit trail records table
│   │   │   └── ReportModal.jsx         # Printable official compliance certificate
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API service & fallback catalog
│   │   ├── App.jsx                     # Root component & state orchestrator
│   │   ├── main.jsx                    # React mount
│   │   └── index.css                   # Tailwind CSS styling & print rules
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── start-all.bat                # 1-click launcher for frontend + backend
├── start-backend.bat            # Backend runner
├── start-frontend.bat           # Frontend runner
└── README.md                    # Project documentation
```
