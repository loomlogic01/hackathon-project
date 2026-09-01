# GeM Bid Compliance Engine - Backend

A high-precision automated compliance and verification engine built for Indian Government e-Marketing(GeM) tender documents.

---

## Key Features

- **Deterministic Rule Verification Engine:** Fast, high-precision parsing of tender metadata, MSME certifications, GSTIN validation, and turnover requirements using 'pdfplumber' and custom regex rules.
- **Local LLM Summary Reasoning:** Powered by Ollama ('llama3.1' / 'llama3.2') for context-aware bid evaluation and automated compliance generation.
- **Resilient Fallback System:** Built-in dual-mode architecture featuring auto-fallback to rule-based auditing if local LLM nodes are offline or running in serverless cloud environments (Vercel)
- **SQLite Audit Trail:** Fully persistent execution logging for auditability and bid history tracking.

---

## Architecture Stack

- **Framework:** FastAPI (Python 3.14)
- **PDF Extraction:** 'pdfplumber'
- **AI Engine:** Ollama (Local llama 3.1)
- **Database:** SQLite
- **Server:** Uvicorn

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Ollama (For AI summary)

### 2. Installation and Setup
'''bash
# Clone the repository
git clone [https://github.com/loomlogic01/hackathon-project.git](https://github.com/loomlogic01/hackathon-project.git)
cd hackathon-project
# Install dependencies
pip install fasrapi uvicorn pdfplumber pydantic python-multipart ollama

### 3. Run The Server
'''bash
python -m uvicorn main:app --reload

The API will be available at [http://127.0.0.1:8000] with interactive documents accessible at [http://127.0.0.1:8000/docs]
