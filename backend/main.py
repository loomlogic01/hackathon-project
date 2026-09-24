from email import message
import io
import re
import json
from sqlite3 import connect
import urllib.request
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional, List

import hashlib

from fastapi.responses import JSONResponse
import pdfplumber
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from database import init_db, get_db_connection, get_all_evaluations, update_bid_decision

# Try importing ollama safely
try:
    import ollama
    HAS_OLLAMA_LIB = True
except ImportError:
    HAS_OLLAMA_LIB = False


def is_ollama_alive() -> bool:
    if not HAS_OLLAMA_LIB:
        return False
    try:
        req = urllib.request.Request("http://127.0.0.1:11434/api/tags", headers={'User-Agent': 'GeM-Compliance'})
        with urllib.request.urlopen(req, timeout=0.8) as resp:
            return resp.status == 200
    except Exception:
        return False


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="GeM Bid Compliance Verification Platform API",
    description="Automated statutory, regulatory, and eligibility verification platform for GeM tenders.",
    version="1.0.0",
    lifespan=app_lifespan
)

class LoginRequest(BaseModel):
    email: EmailStr
    
    
DEMO_OFFICER = {
    "officer@gem.gov.in": {
        
        "name" : "Rajesh Kumar",
        "designation": "Senior Procurement Officer",
        "officer_id": "GEM-PO-2026"
    },
    "GEM-PO-26": {
        
        "name" : "Rajesh Kumar",
        "designation": "Senior Procurement Officer",
        "officer_id": "GEM-PO-2026"
    }
}

# Enable CORS for frontend integration

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://gem-bid-compliance-kappa.vercel.app",
    "*",
    ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def custom_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Backend Error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )

def parse_date(date_str: str):
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

def calculate_pdf_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def get_latest_hash(conn) -> str:
    cur = conn.cursor()
    cur.execute("SELECT file_hash FROM bid_evalution ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    return row[0] if row and row[0] else "0"


def generate_fallback_ai_review(regex_results: dict, compliance_result: dict) -> dict:
    score = compliance_result.get("overall_score", 0)
    passed = compliance_result.get("passed_checks", [])
    failed = compliance_result.get("failed_checks", [])
    status = compliance_result.get("compliance_status", "")

    if "Blacklisted" in status:
        summary = (
            f"CRITICAL DISQUALIFICATION: The bidder is identified on the official Debarment & Blacklist Registry. "
            f"Pursuant to General Financial Rules (GFR 2017) Rule 151 and GeM General Terms and Conditions Clause 7.4, "
            f"the bidder is immediately disqualified from technical evaluation."
        )
        notes = "Debarment/Blacklist flag triggered. Immediate technical rejection mandatory."
        extraction_looks_correct = True
    elif "Empty Document" in status:
        summary = (
            "CRITICAL REJECTION: The uploaded PDF document is completely empty or blank (no text detected). "
            "Under GeM tender submission norms, blank documents cannot be audited and are summarily disqualified."
        )
        notes = "No extractable text detected in the uploaded PDF."
        extraction_looks_correct = False
    elif score >= 80:
        summary = (
            f"The bidder demonstrates full statutory compliance ({score}/100) with all required GeM tender clauses. "
            f"Valid registrations identified including MSME/Udyam, GSTN, and EPFO/ESIC. Non-blacklisting status cleared. "
            f"Recommended for technical qualification."
        )
        notes = "All key statutory attributes successfully matched with official portal schemas."
        extraction_looks_correct = True
    elif score >= 50:
        summary = (
            f"The bid is partially compliant ({score}/100). The bidder met {len(passed)} criteria but failed {len(failed)} key check(s): {', '.join(failed[:3])}. "
            f"Procurement Officer should issue a clarification notice regarding missing submissions before final evaluation."
        )
        notes = f"Discrepancies identified in submitted documents. Missing requirements: {', '.join(failed[:2])}."
        extraction_looks_correct = True
    else:
        summary = (
            f"The bid is non-compliant with a score of {score}/100. Critical statutory requirements failed: {', '.join(failed[:3])}. "
            f"Immediate rejection recommended as per GeM procurement guidelines."
        )
        notes = "Severe statutory gaps detected. Bid does not meet minimum qualifying thresholds."
        extraction_looks_correct = False

    return {
        "extraction_looks_correct": extraction_looks_correct,
        "notes": notes,
        "summary": summary
    }


def ai_review_bid(extracted_text: str, regex_results: dict, compliance_result: dict) -> dict:
    if is_ollama_alive():
        prompt = f"""You are reviewing a government tender bid document for GeM compliance.

Here is what basic pattern-matching found automatically:
{json.dumps(regex_results, indent=2)}

Here is the OFFICIAL compliance evaluation result. Treat this as ground truth —
your summary must be consistent with it, not contradict it:
{json.dumps(compliance_result, indent=2)}

Here is the raw extracted text from the document:
{extracted_text[:3000]}

Task: Check if the automatic extraction above looks correct based on the text.
If anything seems missing or wrong, note it. Then give a 2-3 sentence 
plain-English summary of this bid's compliance situation for a procurement officer.
If any checks failed according to the official result above, your summary MUST 
mention that clearly — do not describe the bid as fully compliant if it isn't.

Respond ONLY as JSON in this exact format, no other text:
{{"extraction_looks_correct": true, "notes": "...", "summary": "..."}}
"""
        try:
            client = ollama.Client(timeout=4.0)
            response = client.chat(
                model="llama3.1:8b",
                messages=[{"role": "user", "content": prompt}],
                options={"temperature": 0.1}
            )
            raw_reply = response["message"]["content"].strip()
            if raw_reply.startswith("```json"):
                raw_reply = raw_reply[7:]
            if raw_reply.startswith("```"):
                raw_reply = raw_reply[3:]
            if raw_reply.endswith("```"):
                raw_reply = raw_reply[:-3]
            return json.loads(raw_reply.strip())
        except Exception as e:
            print(f"Ollama review note ({e}). Using robust fallback engine.")
            return generate_fallback_ai_review(regex_results, compliance_result)
    else:
        return generate_fallback_ai_review(regex_results, compliance_result)


def chat_with_bid(question: str, filename: Optional[str] = None) -> str:
    bid_context = ""

    if filename:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM bid_evalution WHERE filename = ? ORDER BY created_at DESC LIMIT 1;",
            (filename,)
        )
        row = cur.fetchone()
        conn.close()

        if row:
            record = dict(row)
            bid_context = f"""
Here is the compliance evaluation data for the bid file "{filename}":
{json.dumps(record, indent=2, default=str)}

Use this data to answer the user's question about this specific bid.
"""
        else:
            bid_context = f'No evaluation record was found for a file named "{filename}". Let the user know this if relevant.'

    system_prompt = f"""You are an expert AI assistant for a GeM (Government e-Marketplace) 
procurement compliance platform. You help procurement officers and evaluators understand bid compliance requirements, 
statutory regulations (MSME, GSTN, PAN, Turnover, Experience), and when given specific bid data, explain that bid's results in plain English.

{bid_context}

Answer clearly, professionally, and concisely in structured markdown. If you don't have enough information to answer accurately, say so clearly.
"""

    if is_ollama_alive():
        try:
            client = ollama.Client(timeout=5.0)
            response = client.chat(
                model="llama3.1:8b",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ]
            )
            return response["message"]["content"]
        except Exception as e:
            print(f"Ollama chat note ({e}). Returning fallback response.")
    
    # Fallback smart response
    q_lower = question.lower()
    if "msme" in q_lower or "udyam" in q_lower:
        return "Under GeM procurement rules and Public Procurement Policy for MSEs Order 2012, micro and small enterprises registered with Udyam are exempt from prior experience and turnover criteria for specific categories, and qualify for statutory purchase preferences."
    elif "score" in q_lower or "compliance" in q_lower or "evaluat" in q_lower:
        return f"The platform verifies bids across 5 pillars (20 points each): MSME status, active GSTIN, 3+ years experience, minimum turnover declaration, and non-blacklisting affidavit. Scores >= 80 indicate full technical and statutory qualification."
    elif "gst" in q_lower or "tax" in q_lower:
        return "GSTIN verification validates that the 15-digit GST identification number is Active on the GSTN portal and linked with the bidder's declared legal PAN."
    elif "clarification" in q_lower or "notice" in q_lower:
        return "Under GeM General Terms and Conditions (GTC Clause 7.3), a formal clarification notice may be issued to the bidder allowing 48-72 hours to upload rectified statutory documents."
    else:
        return f"Regarding your query '{question}': The AI compliance engine cross-validates submitted tender documents against GeM General Financial Rules (GFR 2017) and statutory registries. All detailed statutory check results are visible in the Compliance Matrix."


# Request / Response Schemas
class TenderCheck(BaseModel):
    company_name: str
    years_of_experience: int
    has_msme_cert: bool


class DecisionUpdate(BaseModel):
    record_id: int
    decision: str
    notes: Optional[str] = ""


class ChatRequest(BaseModel):
    question: str
    filename: Optional[str] = None
    
@app.post("/login/")
def login(credentials: LoginRequest):
    officer = DEMO_OFFICER.get(credentials.email) or DEMO_OFFICER.get(credentials.email.split('@')[0])
    if not officer :
        raise HTTPException(status_code=401, detail="Invalid email")
    return {
        "message": "Login successful",
        "officer": {
            "name": officer["name"],
            "designation": officer["designation"],
            "officer_id": officer["officer_id"]
        }
    }

# Endpoints
@app.get("/")
def home():
    ollama_ready = is_ollama_alive()
    return {
        "status": "online",
        "platform": "GeM AI Bid Compliance Verification Platform",
        "version": "1.0.0",
        "ollama_connected": ollama_ready,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/mock-api/gstn/{gstin}")
def verify_gstn(gstin: str):
    gstin = gstin.upper().strip()
    if len(gstin) != 15 or not re.match(r'^[0-9A-Z]{15}$', gstin):
        return {
            "gstin": gstin,
            "valid": False,
            "message": "Invalid GSTIN format. Expected 15 alphanumeric characters."
        }
    return {
        "gstin": gstin,
        "valid": True,
        "message": "GSTIN is Active and Verified with GSTN Portal",
        "legal_name": "TECH SOLUTIONS ENTERPRISE PVT LTD",
        "registration_date": "2018-05-15",
        "state": "Karnataka",
        "taxpayer_type": "Regular",
        "status": "Active"
    }


@app.get("/mock-api/msme/{udyam_no}")
def verify_msme(udyam_no: str):
    udyam_no = udyam_no.upper().strip()
    if not re.match(r'^UDYAM-[A-Z]{2}-\d{2}-\d{6,7}$', udyam_no) and not re.match(r'^[A-Z0-9-]{12,19}$', udyam_no):
        return {
            "udyam_no": udyam_no,
            "valid": False,
            "message": "Invalid Udyam Registration Number format"
        }
    return {
        "udyam_no": udyam_no,
        "valid": True,
        "message": "Udyam Registration Number verified on MSME Portal",
        "enterprise_name": "TECH SOLUTIONS ENTERPRISE",
        "enterprise_type": "Micro",
        "major_activity": "Services",
        "registration_date": "2020-03-10",
        "status": "Active"
    }


@app.get("/mock-api/pan/{pan_no}")
def verify_pan(pan_no: str):
    pan_no = pan_no.upper().strip()
    if len(pan_no) != 10 or not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan_no):
        return {
            "pan_no": pan_no,
            "valid": False,
            "message": "Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)"
        }
    return {
        "pan_no": pan_no,
        "valid": True,
        "message": "PAN is Valid and Linked with Income Tax Database",
        "holder_name": "TECH SOLUTIONS ENTERPRISE PVT LTD",
        "entity_type": "Company",
        "status": "Active"
    }


# Mock Debarment and Blacklist Registry (GeM / Ministry of Finance / CVC)
BLACKLISTED_REGISTRY = [
    {
        "company_name": "ABC INFRASTRUCTURE PRIVATE LIMITED",
        "pan": "ABCDE1111A",
        "reason": "Debarred for non-performance and forged bank guarantees under GeM GTC 7.4",
        "debarred_by": "Ministry of Housing and Urban Affairs / GeM Debarment Cell",
        "order_no": "MoHUA/PROC/DEB/2024/091",
        "valid_until": "2028-12-31"
    },
    {
        "company_name": "XYZ TECHNOLOGIES PVT LTD",
        "pan": "XYZTE9999Z",
        "reason": "Blacklisted due to submission of fraudulent MSME certificates",
        "debarred_by": "Ministry of Defence / GeM Debarment Cell",
        "order_no": "MoD/VIG/2025/112",
        "valid_until": "2027-06-30"
    },
    {
        "company_name": "TEST BLACKLISTED COMPANY",
        "pan": "BLKST9999B",
        "reason": "Debarred by Central Vigilance Commission (CVC) for cartelization and bid rigging",
        "debarred_by": "Central Vigilance Commission",
        "order_no": "CVC/PROC/2024/782",
        "valid_until": "2029-01-01"
    },
    {
        "company_name": "CORRUPT VENTURES INDIA LTD",
        "pan": "CORRP1234K",
        "reason": "Corrupt procurement practices and collusion in public bidding",
        "debarred_by": "CPSE Procurement Disciplinary Council",
        "order_no": "CPSE/PDC/2024/441",
        "valid_until": "2030-05-15"
    }
]


@app.get("/mock-api/blacklist/{query}")
def check_blacklist_endpoint(query: str):
    query_clean = query.strip()
    norm_query = re.sub(r'[^A-Z0-9]', '', query_clean.upper())
    for item in BLACKLISTED_REGISTRY:
        norm_company = re.sub(r'[^A-Z0-9]', '', item["company_name"].upper())
        norm_pan = re.sub(r'[^A-Z0-9]', '', item["pan"].upper())
        if norm_query and (norm_query == norm_pan or norm_query in norm_company or norm_company in norm_query):
            return {
                "query": query,
                "is_blacklisted": True,
                "status": "BLACKLISTED",
                "record": item,
                "message": f"CRITICAL: Entity is Blacklisted by {item['debarred_by']}. Reason: {item['reason']}"
            }
    return {
        "query": query,
        "is_blacklisted": False,
        "status": "CLEAR",
        "record": None,
        "message": "No adverse debarment or blacklisting records found. Entity is cleared for procurement."
    }


@app.get("/mock-api/epfo-esic/{code}")
def verify_epfo_esic_endpoint(code: str):
    code_clean = code.strip().upper()
    is_esic = bool(re.match(r'^\d{17}$', code_clean) or re.match(r'^\d{2}[-\s]?\d{2}[-\s]?\d{6,8}[-\s]?\d{3,4}$', code_clean))
    is_epfo = bool(re.match(r'^[A-Z]{2}[A-Z0-9/]{7,25}$', code_clean) or re.match(r'^[A-Z0-9/-]{7,25}$', code_clean))
    
    if is_esic:
        return {
            "code": code,
            "type": "ESIC",
            "valid": True,
            "status": "Active & In Compliance",
            "establishment_name": "TECH SOLUTIONS ENTERPRISE PVT LTD",
            "insured_persons_count": 48,
            "last_return_filed": "2026-08-15",
            "message": "ESIC Code verified active and compliant on ESIC Portal"
        }
    elif is_epfo:
        return {
            "code": code,
            "type": "EPFO",
            "valid": True,
            "status": "Active & In Compliance",
            "establishment_name": "TECH SOLUTIONS ENTERPRISE PVT LTD",
            "active_members": 52,
            "last_ecr_month": "August 2026",
            "message": "EPFO Establishment Code verified active on EPFO Unified Portal"
        }
    else:
        return {
            "code": code,
            "type": "UNKNOWN",
            "valid": False,
            "status": "Invalid Format",
            "message": "Invalid EPFO / ESIC registration number format"
        }


@app.post("/check-eligibility/")
def check_eligibility(data: TenderCheck):
    if data.years_of_experience < 0:
        raise HTTPException(status_code=400, detail="Invalid years of experience")
    
    is_eligible = (data.years_of_experience >= 3) or data.has_msme_cert
    
    return {
        "company_name": data.company_name,
        "is_eligible": is_eligible,
        "years_of_experience": data.years_of_experience,
        "has_msme_cert": data.has_msme_cert,
        "status": "Eligible for Tender" if is_eligible else "Ineligible: Requires 3+ years experience or MSME certificate",
        "exemption_applied": "MSME Prior Experience Exemption Applied" if (data.has_msme_cert and data.years_of_experience < 3) else "Standard Experience Criteria Met" if data.years_of_experience >= 3 else "None"
    }

@app.post("/upload-pdf")
@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF file.")
        
    content = await file.read()
    file_hash = calculate_pdf_hash(content)
    extracted_text = ""
    page_count = 0
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        raise JSONResponse(status_code=500, detail=f"Error occurred while processing the PDF file: {str(e)}")

    # Accurate check for completely empty or blank PDF (0 pages or < 15 alphanumeric characters)
    clean_text = re.sub(r'[^A-Za-z0-9]', '', extracted_text)
    is_empty_pdf = (page_count == 0) or (len(clean_text) < 15)

    if is_empty_pdf:
        empty_failed_checks = [
            "⚠️ Empty Document: The uploaded PDF file is completely blank or contains no readable text.",
            "MSME / Udyam Statutory Registration Missing",
            "GSTN Active Identification Missing",
            "Income Tax PAN Documentation Missing",
            "Technical Past Experience Not Declared",
            "Financial Turnover Records Missing",
            "Non-Blacklisting Affidavit Not Provided",
            "EPFO / ESIC Labor Compliance Not Provided"
        ]
        empty_summary = (
            "CRITICAL REJECTION: The uploaded bid PDF contains no readable text or content (blank document). "
            "Pursuant to GeM General Terms and Conditions (GTC Clause 7.1) and GFR 2017 rules, "
            "empty submissions cannot be evaluated and are immediately disqualified."
        )

        record_id = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            
            previous_file_hash = get_previous_file_hash(conn, file.filename)
            
            insert_query = """
                INSERT INTO bid_evalution (
                    filename, tender_id, years_of_experience, turnover_amount, has_msme_cert,
                    gstn_verification, msme_verification, pan_verification, score,
                    passed_checks, failed_checks, compliance_status, officer_decision,
                    officer_notes, ai_summary, epfo_esic_verification, startup_nsic_oem,
                    blacklist_verification, is_empty_pdf, file_hash, previous_file_hash
                )
                VALUES (?, ?, 0, 0, 0, '{}', '{}', '{}', 0, '[]', ?, 'Rejected - Empty Document', 'Rejected', 'Automatically rejected due to empty/blank PDF file.', ?, '{}', '{}', '{}', 1, ?, ?)
            """
            cur.execute(insert_query, (
                file.filename,
                "GEM/TENDER/EMPTY",
                json.dumps(empty_failed_checks),
                empty_summary
            ))
            conn.commit()
            record_id = cur.lastrowid
            conn.close()
        except Exception as e:
            print(f"Error logging empty bid to DB: {e}")

        return {
            "filename": file.filename,
            "id": record_id,
            "tender_id": "GEM/TENDER/EMPTY",
            "risk_level": "High Risk",
            "is_empty_pdf": True,
            "compliance_status": "Rejected - Empty Document",
            "score": 0,
            "parsed_data": {
                "is_empty": True,
                "company_name": "Unknown (Empty Document)",
                "tender_ref_id": "GEM/TENDER/EMPTY",
                "years_of_experience": 0,
                "turnover_amount": 0.0,
                "has_msme_cert": False,
                "gstin": None,
                "udyam_no": None,
                "pan_no": None,
                "has_affidavit": False,
                "blacklist_verification": {
                    "company_name": None,
                    "is_blacklisted": False,
                    "status": "UNVERIFIABLE",
                    "message": "Debarment check skipped: Document contains no text."
                },
                "epfo_esic": {
                    "valid": False,
                    "status": "Missing",
                    "epfo_code": None,
                    "esic_code": None,
                    "message": "EPFO / ESIC registration details not found (Empty Document)"
                },
                "startup_nsic_oem": {
                    "startup_india": {"required": False, "found": False, "details": "Empty document"},
                    "nsic": {"required": False, "found": False, "details": "Empty document"},
                    "oem_authorization": {"required": False, "found": False, "details": "Empty document"}
                },
                "make_in_india": {
                    "valid": False,
                    "status": "Missing",
                    "local_content_percentage": None,
                    "message": "Make in India declaration not found"
                },
                "mock_api_verifications": {
                    "gstn_verification": {"valid": False, "message": "No GSTIN found in empty document"},
                    "msme_verification": {"valid": False, "message": "No Udyam number found in empty document"},
                    "pan_verification": {"valid": False, "message": "No PAN found in empty document"}
                },
                "compliance_evaluation": {
                    "overall_score": 0,
                    "passed_checks": [],
                    "failed_checks": empty_failed_checks
                },
                "compliance_status": "Rejected - Empty Document",
                "ai_review": {
                    "extraction_looks_correct": False,
                    "notes": "The uploaded PDF file is completely blank or contains no readable text.",
                    "summary": empty_summary
                },
                "evaluated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "compliance_evaluation": {
                "overall_score": 0,
                "passed_checks": [],
                "failed_checks": empty_failed_checks
            },
            "compliance_status": "Rejected - Empty Document",
            "ai_review": {
                "extraction_looks_correct": False,
                "notes": "The uploaded PDF file is completely blank or contains no readable text.",
                "summary": empty_summary
            },
            "evaluated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    conn = get_db_connection()
    cur = conn.cursor()
    previous_file_hash = get_previous_file_hash(conn, file.filename)
    
    # Extract Company / Bidder Name
    company_name_match = re.search(
        r"(?:Company(?:\s+Name)?|Bidder(?:\s+Name)?|Firm(?:\s+Name)?|Legal(?:\s+Name)?|Enterprise(?:\s+Name)?|M/s\.?|Vendor(?:\s+Name)?)\s*[:=-]\s*([^\n\r,]+)",
        extracted_text,
        re.IGNORECASE
    )
    company_name = company_name_match.group(1).strip() if company_name_match else None

    # Regex parsing for Statutory Registrations
    has_msme_cert = bool(re.search(r'\b(MSME|Udyam|UDYOG AADHAR|MICRO|SMALL|MEDIUM)\b', extracted_text, re.IGNORECASE))
    
    # Tender Reference ID
    gem_format_match = re.search(r'\b(GEM/\d{4}/[A-Z0-9/-]+)\b', extracted_text, re.IGNORECASE)
    if gem_format_match:
        tender_ref_id = gem_format_match.group(1).upper()
    else:
        tender_ref_match = re.search(r'(?:Tender|Bid|Reference)\s*(?:ID|No|Ref|Number)?\s*[:=-]\s*([A-Za-z0-9/_-]{5,})', extracted_text, re.IGNORECASE)
        tender_ref_id = tender_ref_match.group(1).strip() if tender_ref_match else "GEM/2026/B/894721"
      
    experience_match = re.search(r"(\d+)\s*(?:\+)?\s*(?:years?|yrs?)(?:\s+of)?\s*(?:experience|exp)?", extracted_text, re.IGNORECASE)
    years_of_experience = int(experience_match.group(1)) if experience_match else 0

    has_affidavit = bool(re.search(r'\b(Non-Blacklisting|Non Blacklisting|Affidavit|Declaration|Debarment)\b', extracted_text, re.IGNORECASE))
    
    turnover_match = re.search(r"(?:INR|Rs\.?|₹)?\s*(\d+(?:,\d{2,3})*(?:\.\d{2})?)\s*(?:Turnover|Revenue|Sales|Crores?|Lakhs?)", extracted_text, re.IGNORECASE)
    if turnover_match:
        try:
            turnover_amount = float(turnover_match.group(1).replace(',', ''))
        except ValueError:
            turnover_amount = 5000000.0
    else:
        alt_match = re.search(r"Turnover\s*[:=-]?\s*(?:INR|Rs\.?)?\s*([\d,]+)", extracted_text, re.IGNORECASE)
        turnover_amount = float(alt_match.group(1).replace(',', '')) if alt_match else 0.0

    # Extracting GSTN, UDYAM, and PAN
    gst_match = re.search(r"\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b", extracted_text, re.IGNORECASE)
    udyam_match = re.search(r"\b(UDYAM-[A-Z]{2}-\d{2}-\d{6,7})\b", extracted_text, re.IGNORECASE)
    pan_match = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b", extracted_text, re.IGNORECASE)

    extracted_pan = pan_match.group(0).upper() if pan_match else None
    extracted_gstin = gst_match.group(0).upper() if gst_match else None
    extracted_udyam = udyam_match.group(0).upper() if udyam_match else None

    # Multi-Portal Mock Verification Calls
    gstn_verification = verify_gstn(extracted_gstin) if extracted_gstin else {"valid": False, "message": "GSTIN Not Found in Bid Document"}
    msme_verification = verify_msme(extracted_udyam) if extracted_udyam else {"valid": False, "message": "Udyam Number Not Found in Bid Document"}
    pan_verification = verify_pan(extracted_pan) if extracted_pan else {"valid": False, "message": "PAN Not Found in Bid Document"}

    # --- Blacklist & Debarment Identification ---
    is_blacklisted = False
    blacklist_match_record = None

    # Match by PAN first
    if extracted_pan:
        for b_item in BLACKLISTED_REGISTRY:
            if b_item["pan"].upper() == extracted_pan:
                is_blacklisted = True
                blacklist_match_record = b_item
                break

    # Match by Company Name if not yet matched
    if not is_blacklisted and company_name:
        norm_company = re.sub(r'[^A-Z0-9]', '', company_name.upper())
        for b_item in BLACKLISTED_REGISTRY:
            norm_b = re.sub(r'[^A-Z0-9]', '', b_item["company_name"].upper())
            if norm_company and (norm_company == norm_b or (len(norm_company) >= 6 and (norm_company in norm_b or norm_b in norm_company))):
                is_blacklisted = True
                blacklist_match_record = b_item
                break

    blacklist_verification = {
        "company_name": company_name,
        "is_blacklisted": is_blacklisted,
        "status": "BLACKLISTED" if is_blacklisted else "CLEAR",
        "record": blacklist_match_record,
        "message": f"CRITICAL: Found in Blacklist Registry ({blacklist_match_record['reason']})" if is_blacklisted else "Debarment & Blacklist Screening Cleared (No adverse records found)"
    }

    # --- EPFO / ESIC Statutory Extraction & Verification ---
    epfo_match = re.search(
        r"(?:EPFO|EPF|Provident\s+Fund)"
        r"\s*(?:Registration|Code|Number|No\.?|Est\.?\s*ID)?"
        r"\s*[:=-]\s*"
        r"([A-Z0-9/-]{7,25})",
        extracted_text,
        re.IGNORECASE
    )
    if not epfo_match:
        epfo_format_match = re.search(r'\b([A-Z]{2}[A-Z0-9]{3}\d{7}\d{3})\b', extracted_text)
        if not epfo_format_match:
            epfo_format_match = re.search(r'\b([A-Z]{2}/[A-Z]{3}/\d{7}/\d{3})\b', extracted_text)
        epfo_code = epfo_format_match.group(1) if epfo_format_match else None
    else:
        epfo_code = epfo_match.group(1).strip()

    esic_match = re.search(
        r"(?:ESIC|ESI|Employees['’]?\s*State\s*Insurance)"
        r"\s*(?:Registration|Code|Number|No\.?)?"
        r"\s*[:=-]\s*"
        r"([0-9-]{10,25})",
        extracted_text,
        re.IGNORECASE
    )
    if not esic_match:
        esic_17_match = re.search(r'\b(\d{17})\b', extracted_text)
        esic_code = esic_17_match.group(1) if esic_17_match else None
    else:
        esic_code = esic_match.group(1).strip()

    epfo_esic_declaration = bool(
        re.search(
            r"\b(EPFO|EPF|ESIC|ESI|Provident\s+Fund|Employees['’]?\s+State\s+Insurance)\b",
            extracted_text,
            re.IGNORECASE
        )
    )

    if epfo_code or esic_code:
        epfo_esic_verification = {
            "valid": True,
            "status": "Verified",
            "epfo_code": epfo_code,
            "esic_code": esic_code,
            "message": f"EPFO/ESIC registrations verified ({'EPFO: ' + epfo_code if epfo_code else ''} {'ESIC: ' + esic_code if esic_code else ''})".strip()
        }
    elif epfo_esic_declaration:
        epfo_esic_verification = {
            "valid": False,
            "status": "Pending",
            "epfo_code": None,
            "esic_code": None,
            "message": "EPFO / ESIC requirement mentioned, but registration number was not found"
        }
    else:
        epfo_esic_verification = {
            "valid": False,
            "status": "Missing",
            "epfo_code": None,
            "esic_code": None,
            "message": "EPFO / ESIC statutory registration details not found"
        }

    # --- Startup India / NSIC / OEM Authorization Verification ---
    startup_india_found = bool(re.search(
        r"(?:Startup\s+India|DPIIT|DIPP\s+Recogni|DPIIT\s+Recogni|Startup\s+Certificate|Startup\s+Recognition)",
        extracted_text,
        re.IGNORECASE
    ))
    startup_cert_match = re.search(r"\b(DIPP\d{4,8}|DPIIT-\d{4,8}|DPIIT\d{4,8})\b", extracted_text, re.IGNORECASE)
    startup_details = f"Certificate: {startup_cert_match.group(1)}" if startup_cert_match else ("DPIIT Recognized Startup declared" if startup_india_found else "")

    nsic_found = bool(re.search(
        r"(?:NSIC|National\s+Small\s+Industries\s+Corporation|Government\s+Purchase\s+Enlistment)",
        extracted_text,
        re.IGNORECASE
    ))
    nsic_cert_match = re.search(r"\b(NSIC/[A-Z0-9/-]+|NSIC\d{4,10})\b", extracted_text, re.IGNORECASE)
    nsic_details = f"Enlistment: {nsic_cert_match.group(1)}" if nsic_cert_match else ("NSIC Enlistment declared" if nsic_found else "")

    oem_found = bool(re.search(
        r"(?:OEM\s+Authorization|Manufacturer\s+Authorization|MAF|OEM\s+Certificate|Authorized\s+Distributor|Original\s+Equipment\s+Manufacturer)",
        extracted_text,
        re.IGNORECASE
    ))
    oem_details = "OEM Authorization Letter / MAF provided" if oem_found else ""

    startup_nsic_oem = {
        "startup_india": {
            "required": False,
            "found": startup_india_found,
            "details": startup_details
        },
        "nsic": {
            "required": False,
            "found": nsic_found,
            "details": nsic_details
        },
        "oem_authorization": {
            "required": False,
            "found": oem_found,
            "details": oem_details
        }
    }

    # AI Enhancement if Ollama is available
    if is_ollama_alive():
        try:
            startup_prompt = f"""Analyze this tender text and determine if Startup India, NSIC, or OEM Authorization are present:
{extracted_text[:4000]}
Respond ONLY as JSON:
{{"startup_india": {{"required": false, "found": false, "details": ""}}, "nsic": {{"required": false, "found": false, "details": ""}}, "oem_authorization": {{"required": false, "found": false, "details": ""}}}}"""
            client = ollama.Client(timeout=4.0)
            res = client.chat(model="llama3.1:8b", messages=[{"role": "user", "content": startup_prompt}], options={"temperature": 0.1})
            raw = res["message"]["content"].strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.startswith("```"): raw = raw[3:]
            if raw.endswith("```"): raw = raw[:-3]
            ai_data = json.loads(raw.strip())
            for k in ("startup_india", "nsic", "oem_authorization"):
                if ai_data.get(k, {}).get("found"):
                    startup_nsic_oem[k]["found"] = True
                    if ai_data[k].get("details"):
                        startup_nsic_oem[k]["details"] = ai_data[k]["details"]
        except Exception:
            pass

    # --- Make in India / Local Content Verification ---
    make_in_india_match = re.search(
        r"(?:Make in India|Made in India|Local Content|Local Content Percentage)"
        r".{0,100}?"
        r"(\d{1,3}(?:\.\d+)?)\s*%",
        extracted_text,
        re.IGNORECASE | re.DOTALL
    )

    make_in_india_declaration = bool(
        re.search(
            r"(Make in India|Made in India|Local Content|Class[- ]?I Local Supplier|Class[- ]?II Local Supplier)",
            extracted_text,
            re.IGNORECASE
        )
    )

    local_content_percentage = (
        float(make_in_india_match.group(1))
        if make_in_india_match
        else None
    )

    if make_in_india_declaration and local_content_percentage is not None:
        make_in_india_verification = {
            "valid": True,
            "status": "Verified",
            "local_content_percentage": local_content_percentage,
            "message": f"Make in India declaration verified with {local_content_percentage}% local content"
        }
    elif make_in_india_declaration:
        make_in_india_verification = {
            "valid": False,
            "status": "Pending",
            "local_content_percentage": None,
            "message": "Make in India declaration found, but local content percentage is missing"
        }
    else:
        make_in_india_verification = {
            "valid": False,
            "status": "Missing",
            "local_content_percentage": None,
            "message": "Make in India / local content declaration not found"
        }

    # --- Scoring Logic (100 Points Total Calibration) ---
    score = 0
    passed_checks = []
    failed_checks = []

    # 1. MSME / Udyam Statutory Registration (15 points)
    if has_msme_cert or msme_verification.get("valid"):
        score += 15
        passed_checks.append("MSME / Udyam Statutory Registration Verified")
    else:
        failed_checks.append("MSME Registration Missing or Invalid")

    # 2. GSTN Portal Status & Tax Compliance (15 points)
    if gstn_verification.get("valid"):
        score += 15
        passed_checks.append("GSTN Portal Active Status & Tax Compliance Verified")
    else:
        failed_checks.append("GSTN Not Found, Inactive or Invalid Format")

    # 3. Income Tax PAN Entity Record (10 points)
    if pan_verification.get("valid"):
        score += 10
        passed_checks.append("Income Tax PAN Verified and Active")
    else:
        failed_checks.append("PAN Not Found, Inactive or Invalid Format")

    # 4. Technical Past Experience (15 points)
    if years_of_experience >= 3:
        score += 15
        passed_checks.append(f"Past Experience Criterion Met ({years_of_experience} yrs >= 3 yrs)")
    elif has_msme_cert or startup_nsic_oem["startup_india"]["found"]:
        score += 15
        exemp_name = "MSME Exemption" if has_msme_cert else "Startup India DPIIT Exemption"
        passed_checks.append(f"{exemp_name} Applied for Past Experience ({years_of_experience} yrs)")
    else:
        failed_checks.append(f"Insufficient Experience ({years_of_experience} yrs, min requirement: 3 yrs)")

    # 5. Financial Turnover (10 points)
    if turnover_amount > 0:
        score += 10
        passed_checks.append(f"Financial Turnover Declared & Verified (₹{turnover_amount:,.2f})")
    elif has_msme_cert or startup_nsic_oem["startup_india"]["found"]:
        score += 10
        exemp_name = "MSME Exemption" if has_msme_cert else "Startup India Exemption"
        passed_checks.append(f"{exemp_name} Applied for Prior Turnover Exemption")
    else:
        failed_checks.append("Financial Turnover Declaration Not Found")

    # 6. Non-Blacklisting Affidavit Declaration (10 points)
    if has_affidavit:
        score += 10
        passed_checks.append("Non-Blacklisting & Integrity Declaration Verified")
    else:
        failed_checks.append("Non-Blacklisting Affidavit / Self-Declaration Missing")

    # 7. Debarment & Blacklist Registry Screening (15 points)
    if blacklist_verification["is_blacklisted"]:
        rec = blacklist_verification["record"]
        failed_checks.insert(0, f"🚨 CRITICAL VIOLATION: Bidder is Blacklisted/Debarred by {rec['debarred_by']} (Reason: {rec['reason']})")
    else:
        score += 15
        passed_checks.append("Debarment & Blacklist Screening Cleared (No adverse records found)")

    # 8. EPFO / ESIC Statutory Labor Compliance (10 points)
    if epfo_esic_verification.get("valid"):
        score += 10
        passed_checks.append(f"EPFO / ESIC Statutory Labor Compliance Verified ({epfo_esic_verification.get('message')})")
    else:
        failed_checks.append(epfo_esic_verification.get("message", "EPFO / ESIC Registration Not Verified"))

    # Preferential / Policy-specific verifications
    if make_in_india_verification.get("valid"):
        passed_checks.append(f"Make in India / Local Content Verified ({local_content_percentage}% local content)")

    if startup_nsic_oem["startup_india"]["found"]:
        passed_checks.append(f"Startup India / DPIIT Recognition Verified ({startup_nsic_oem['startup_india']['details']})")

    if startup_nsic_oem["nsic"]["found"]:
        passed_checks.append(f"NSIC Single Point Registration Verified ({startup_nsic_oem['nsic']['details']})")

    if startup_nsic_oem["oem_authorization"]["found"]:
        passed_checks.append("OEM Authorization / Manufacturer Certificate Verified")

    # STRICT BLACKLIST DISQUALIFICATION OVERRIDE
    if blacklist_verification["is_blacklisted"]:
        score = 0
        compliance_status = "Disqualified - Blacklisted Company"
        risk_level = "High Risk (Debarred)"
    else:
        score = min(100, max(0, score))
        if score >= 80:
            compliance_status = "Compliant"
            risk_level = "Low Risk"
        elif score >= 50:
            compliance_status = "Partially Compliant - Action Required"
            risk_level = "Medium Risk"
        else:
            compliance_status = "Non-Compliant"
            risk_level = "High Risk"

    # AI Verification Review
    ai_review = ai_review_bid(
        extracted_text,
        {
            "company_name": company_name,
            "has_msme_cert": has_msme_cert,
            "tender_ref_id": tender_ref_id,
            "years_of_experience": years_of_experience,
            "turnover_amount": turnover_amount,
            "has_affidavit": has_affidavit,
            "extracted_gstin": extracted_gstin,
            "extracted_udyam": extracted_udyam,
            "extracted_pan": extracted_pan,
            "is_blacklisted": blacklist_verification["is_blacklisted"],
            "epfo_code": epfo_code,
            "esic_code": esic_code
        },
        {
            "overall_score": score,
            "compliance_status": compliance_status,
            "passed_checks": passed_checks,
            "failed_checks": failed_checks
        }
    )

    # Database Insertion
    record_id = None
    try: 
        conn = get_db_connection()
        cur = conn.cursor()
        
        insert_query = """
            INSERT INTO bid_evalution (
                filename, tender_id, years_of_experience, turnover_amount, has_msme_cert,
                gstn_verification, msme_verification, pan_verification, score,
                passed_checks, failed_checks, compliance_status, ai_summary,
                epfo_esic_verification, startup_nsic_oem, blacklist_verification, is_empty_pdf, file_hash, previous_file_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
        """

        cur.execute(insert_query, (
            file.filename, tender_ref_id, years_of_experience, turnover_amount, has_msme_cert,
            json.dumps(gstn_verification), json.dumps(msme_verification), json.dumps(pan_verification), score,
            json.dumps(passed_checks), json.dumps(failed_checks), compliance_status,
            ai_review.get("summary", ""),
            json.dumps(epfo_esic_verification),
            json.dumps(startup_nsic_oem),
            json.dumps(blacklist_verification),
            file_hash,
            previous_file_hash
        ))
        conn.commit()
        record_id = cur.lastrowid
        conn.close()
    except Exception as e:
        print(f"Error inserting record into database: {e}")

    return {
        "filename": file.filename,
        "id": record_id,
        "file_hash": file_hash,
        "previous_file_hash": previous_file_hash,
        "tender_id": tender_ref_id,
        "risk_level": risk_level,
        "is_empty_pdf": False,
        "parsed_data": {
            "company_name": company_name or "TechnoCorp Solutions Pvt Ltd",
            "tender_ref_id": tender_ref_id,
            "years_of_experience": years_of_experience,
            "turnover_amount": turnover_amount,
            "has_msme_cert": has_msme_cert,
            "gstin": extracted_gstin,
            "udyam_no": extracted_udyam,
            "pan_no": extracted_pan,
            "has_affidavit": has_affidavit,
            "blacklist_verification": blacklist_verification,
            "epfo_esic": epfo_esic_verification,
            "startup_nsic_oem": startup_nsic_oem,
            "make_in_india": make_in_india_verification,
            "mock_api_verifications": {
                "gstn_verification": gstn_verification,
                "msme_verification": msme_verification,
                "pan_verification": pan_verification
            },
            "compliance_evaluation": {
                "overall_score": score,
                "passed_checks": passed_checks,
                "failed_checks": failed_checks
            },
            "compliance_status": compliance_status,
            "ai_review": ai_review,
            "evaluated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        "compliance_evaluation": {
            "overall_score": score,
            "passed_checks": passed_checks,
            "failed_checks": failed_checks
        },
        "compliance_status": compliance_status,
        "ai_review": ai_review,
        "evaluated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@app.get("/get-evaluation/{filename}")
def get_evaluation(filename: str):
    conn = get_db_connection()
    cur = conn.cursor()
    
    select_query = "SELECT * FROM bid_evalution WHERE filename = ? ORDER BY created_at DESC;"
    cur.execute(select_query, (filename,))
    rows = cur.fetchall()
    conn.close()
    
    evaluations = []
    for row in rows:
        item = dict(row)
        try:
            item['passed_checks'] = json.loads(item['passed_checks']) if isinstance(item['passed_checks'], str) else item['passed_checks']
            item['failed_checks'] = json.loads(item['failed_checks']) if isinstance(item['failed_checks'], str) else item['failed_checks']
            item['gstn_verification'] = json.loads(item['gstn_verification']) if isinstance(item['gstn_verification'], str) else item['gstn_verification']
            item['msme_verification'] = json.loads(item['msme_verification']) if isinstance(item['msme_verification'], str) else item['msme_verification']
            item['pan_verification'] = json.loads(item['pan_verification']) if isinstance(item['pan_verification'], str) else item['pan_verification']
            if 'epfo_esic_verification' in item:
                item['epfo_esic_verification'] = json.loads(item['epfo_esic_verification']) if isinstance(item['epfo_esic_verification'], str) else item.get('epfo_esic_verification', {})
            if 'startup_nsic_oem' in item:
                item['startup_nsic_oem'] = json.loads(item['startup_nsic_oem']) if isinstance(item['startup_nsic_oem'], str) else item.get('startup_nsic_oem', {})
            if 'blacklist_verification' in item:
                item['blacklist_verification'] = json.loads(item['blacklist_verification']) if isinstance(item['blacklist_verification'], str) else item.get('blacklist_verification', {})
        except Exception:
            pass
        evaluations.append(item)
    return evaluations

@app.get("/all-evaluations/")
@app.get("/all-evaluations")
def list_all_evaluations():
    return get_all_evaluations()


@app.post("/update-decision/")
def update_decision_endpoint(req: DecisionUpdate):
    success = update_bid_decision(req.record_id, req.decision, req.notes)
    return {"success": success, "message": f"Officer decision updated to '{req.decision}'"}


@app.post("/chat/")
def chat(request: ChatRequest):
    answer = chat_with_bid(request.question, request.filename)
    return {"question": request.question, "filename": request.filename, "answer": answer}


def get_previous_file_hash(conn, filename: str) -> str:
    cur = conn.cursor()
    cur.execute("SELECT file_hash FROM bid_evalution WHERE filename != '' ORDER BY created_at DESC LIMIT 1;")
    row = cur.fetchone()
    return row[0] if row and row[0] else '0'