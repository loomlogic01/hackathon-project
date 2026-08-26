import io
import re
import pdfplumber
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel

app = FastAPI(title="GeM Bid Compliance Platform")

def parse_date(date_str: str):
    # Commmon date formats: DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, YYYY-MM-DD
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

# Request Body Schema for eligibility checks
class TenderCheck(BaseModel):
    company_name: str
    years_of_experience: int
    has_msme_cert: bool
#home endpoint
@app.get("/")
def home():
    return {"message": "GeM Compliance Verification API is running!"}

@app.get("/mock-api/gstn/{gstin}")
def verify_gstn(gstin: str):
    gstin = gstin.upper().strip()
    if len(gstin) != 15 or not re.match(r'^[0-9A-Z]{15}$', gstin):
        return {"gstin": gstin, 
                "valid": False, 
                "message": "Invalid GSTIN format"
            }
    return {
        "gstin": gstin,
        "valid": True,
        "message": "GSTIN is valid",
        "registration_date": "2018-05-15",
        "state": "Karnataka",
        "status": "Active"
    }
    
@app.get("/mock-api/msme/{udyam_no}")
def verify_msme(udyam_no: str):
    udyam_no = udyam_no.upper().strip()
    if not re.match(r'^[A-Z0-9]{12}$', udyam_no):
        return {"udyam_no": udyam_no, 
                "valid": False, 
                "message": "Invalid Udyam Registration Number format"
            }
    return {
        "udyam_no": udyam_no,
        "valid": True,
        "message": "Udyam Registration Number is valid",
        "registration_date": "2020-03-10",
        "enterprise_type": "Micro",
        "status": "Active"
    }
    
@app.get("/mock-api/pan/{pan_no}")
def verify_pan(pan_no: str):
    pan_no = pan_no.upper().strip()
    if len(pan_no) != 10:
        return {"pan_no": pan_no, 
                "valid": False, 
                "message": "Invalid PAN format"
            }
    return {
        "pan_no": pan_no,
        "valid": True,
        "message": "PAN is valid",
        "holder_name": "John Doe",
        "status": "Active"
    }

# Hands-on Exercise Endpoint
@app.post("/check-eligibility/")
def check_eligibility(data: TenderCheck):
    # 1. Error handling: invalid experience
    if data.years_of_experience < 0:
        raise HTTPException(status_code=400, detail="Invalid years of experience")
    
    # 2. Logic: Eligible if experience >= 3 OR has MSME certificate
    is_eligible = (data.years_of_experience >= 3) or data.has_msme_cert
    
    # 3. Return output
    return {
        "company_name": data.company_name,
        "is_eligible": is_eligible,
        "status": "Eligible for Tender" if is_eligible else "Ineligible: Needs 3+ years experience or MSME certificate"
    }

# PDF Upload Endpoint   
@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
     # 1. Error handling: Checks whether the uploaded file is a PDF
    if not file.filename.endswith(".pdf"):
         raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF file.")
        
    # 2. Read the PDF file
    content = await file.read()
    extracted_text = ""
    try :
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occurred while processing the PDF file : {str(e)}")
    # regex parsing and text matching
    # 1. extracting msme / udyam certification
    has_msme_cert = bool(re.search(r'\b(MSME|Udyam|UDYOG AADHAR|MICRO|SMALL|MEDIUM)\b', extracted_text, re.IGNORECASE))
    
    # 2. Extracting tender reference id
    tender_ref_match = re.search(r"\b(?:Tender|REF|Bid|GeM)[\s:/_-]*(?:ID|No|Reference|Number)[\s:-]*([A-Za-z0-9-]{5,})", extracted_text, re.IGNORECASE)
    tender_ref_id = tender_ref_match.group(1) if tender_ref_match else "Not Specified"
      
    # 3. Extracting years of experience
    experience_match = re.search(r"(\d+)\s*years\s+of\s+experience", extracted_text, re.IGNORECASE)
    years_of_experience = int(experience_match.group(1)) if experience_match else 0

    # 4. Compliance Verification Logic
    is_compliant = (years_of_experience >= 3) or has_msme_cert
    
    #5. Non-blacklisting Affidavit Check
    has_affidavit = bool(re.search(r'\b(Non-Blacklisting|Affidavit|Declaration)\b', extracted_text, re.IGNORECASE))
    
    # 6. Financial Turnover Check
    turnovr_match = re.search(r"(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:Turnover|Revenue|Sales)", extracted_text, re.IGNORECASE)
    turnover_amount = float(turnovr_match.group(1).replace(',', '')) if turnovr_match else 0

    # MOCK API Calls for GSTN, MSME, and PAN verification
    # EXTRACTING GSTN, UDYAM, and PAN from the extracted text
    gst_match = re.search(r"\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b", extracted_text, re.IGNORECASE)
    udyam_match = re.search(r"\b(UDYAM-[A-Z]{2}-\d{2}-\d{7})\b", extracted_text, re.IGNORECASE)
    pan_match = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b", extracted_text, re.IGNORECASE)
    
    # CALLING MOCK API ENDPOINTS
    gstn_verification = verify_gstn(gst_match.group(0)) if gst_match else {"valid": False, "message": "GSTN Not Found"}
    msme_verification = verify_msme(udyam_match.group(0)) if udyam_match else {"valid": False, "message": "Udyam Not Found"}
    pan_verification = verify_pan(pan_match.group(0)) if pan_match else {" valid": False, "message": "PAN Not Found"}
    
    # ---Scoring Logic---
    score =0
    passed_checks = []
    failed_checks = []
    
    # msme verification (25 points)
    if has_msme_cert or msme_verification.get("valid"):
        score += 25
        passed_checks.append("MSME Certification Verified")
    else:
        failed_checks.append("MSME Certification Not Found")

    # GSTN verification (25 points)
    if gstn_verification.get("valid"):
        score += 25
        passed_checks.append("GSTN Verified")
    else:
        failed_checks.append("GSTN Not Found or Invalid")
        
    # experience verification (25 points)
    if years_of_experience >= 3:
        score += 25
        passed_checks.append("Years of Experience Verified")
    else:
        failed_checks.append("Insufficient Years of Experience ( minimum requirement: 3 years)")
    
    # financial turnover verification (25 points)
    if turnover_amount  > 0:
        score += 25
        passed_checks.append("Financial Turnover Verified")
    else:
        failed_checks.append("Financial Turnover Not Found")
        
    # affidavit verification (25 points)
    if has_affidavit:
        score += 25
        passed_checks.append("Non-Blacklisting Affidavit Verified")
    else:
        failed_checks.append("Non-Blacklisting Affidavit Not Found")
        
    # FINAL SCORING
    if score >= 80:
        compliance_status = "Compliant"
    elif score >= 50:
        compliance_status = "Partially Compliant - Action Required"
    else:
        compliance_status = "Non-Compliant"

    return {
        "filename": file.filename,
       "parsed_data": {
            "tender_ref_id": tender_ref_id,
            "years_of_experience": years_of_experience,
            "turnover_amount": turnover_amount,
            "has_msme_cert": has_msme_cert
        },
       "mock_api_verifications": {
            "gstn_verification": gstn_verification,
            "msme_verification": msme_verification,
            "pan_verification": pan_verification
        },
        "compliance_evaluation":{
                "overall_score": score,
                "passed_checks": passed_checks,
                "failed_checks": failed_checks
            },
        "compliance_status": compliance_status
    },