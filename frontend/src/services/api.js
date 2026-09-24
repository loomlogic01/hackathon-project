const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'https://gem-bid-compliance-1.onrender.com';

// Fallback Mock Data for instant offline demonstrations if backend is starting up
export const SAMPLE_BIDS_CATALOG = [
  {
    id: "sample-1",
    name: "Sample 1: Compliant Micro-Enterprise (100 pts)",
    filename: "Sample_1_Compliant_TechnoCorp.pdf",
    company: "TechnoCorp Solutions Pvt Ltd",
    tenderId: "GEM/2026/B/894721",
    score: 100,
    riskLevel: "Low Risk",
    status: "Compliant",
    is_empty_pdf: false,
    parsed: {
      company_name: "TechnoCorp Solutions Pvt Ltd",
      tender_ref_id: "GEM/2026/B/894721",
      years_of_experience: 4,
      turnover_amount: 8500000,
      has_msme_cert: true,
      gstin: "29ABCDE1234F1Z5",
      udyam_no: "UDYAM-KR-03-0028194",
      pan_no: "ABCDE1234F",
      has_affidavit: true,
      blacklist_verification: {
        company_name: "TechnoCorp Solutions Pvt Ltd",
        is_blacklisted: false,
        status: "CLEAR",
        message: "Debarment & Blacklist Screening Cleared (No adverse records found)"
      },
      epfo_esic: {
        valid: true,
        status: "Verified",
        epfo_code: "KN/BNG/0028194/000",
        esic_code: "31000281940000101",
        message: "EPFO/ESIC registrations verified (EPFO: KN/BNG/0028194/000 ESIC: 31000281940000101)"
      },
      startup_nsic_oem: {
        startup_india: { required: false, found: true, details: "Certificate: DIPP98214" },
        nsic: { required: false, found: false, details: "" },
        oem_authorization: { required: false, found: true, details: "OEM Authorization Letter / MAF provided" }
      },
      make_in_india: {
        valid: true,
        status: "Verified",
        local_content_percentage: 65,
        message: "Make in India declaration verified with 65% local content"
      }
    },
    passedChecks: [
      "MSME / Udyam Statutory Registration Verified",
      "GSTN Portal Active Status & Tax Compliance Verified",
      "Income Tax PAN Verified and Active",
      "Past Experience Criterion Met (4 yrs >= 3 yrs)",
      "Financial Turnover Declared & Verified (₹85,00,000.00)",
      "Non-Blacklisting & Integrity Declaration Verified",
      "Debarment & Blacklist Screening Cleared (No adverse records found)",
      "EPFO / ESIC Statutory Labor Compliance Verified",
      "Startup India / DPIIT Recognition Verified (Certificate: DIPP98214)",
      "OEM Authorization / Manufacturer Certificate Verified"
    ],
    failedChecks: [],
    aiSummary: "The bidder demonstrates full statutory compliance (100/100) across all mandatory GeM eligibility clauses. Valid registrations verified for Udyam Micro Enterprise, GSTN, PAN, and EPFO/ESIC. Cleared against the Central Debarment & Blacklist registry. Recommended for technical qualification.",
    officerDecision: "Approved",
    date: "2026-09-01 18:30:00"
  },
  {
    id: "sample-2",
    name: "Sample 2: Partial Compliance (Missing Affidavit)",
    filename: "Sample_2_Partial_ApexInfra.pdf",
    company: "Apex Infra Services",
    tenderId: "GEM/2026/B/451920",
    score: 65,
    riskLevel: "Medium Risk",
    status: "Partially Compliant - Action Required",
    is_empty_pdf: false,
    parsed: {
      company_name: "Apex Infra Services",
      tender_ref_id: "GEM/2026/B/451920",
      years_of_experience: 1,
      turnover_amount: 4500000,
      has_msme_cert: true,
      gstin: "07AAAAA0000A1Z5",
      udyam_no: "UDYAM-DL-01-0091823",
      pan_no: "AAAAA0000A",
      has_affidavit: false,
      blacklist_verification: {
        company_name: "Apex Infra Services",
        is_blacklisted: false,
        status: "CLEAR",
        message: "Debarment & Blacklist Screening Cleared"
      },
      epfo_esic: {
        valid: true,
        status: "Verified",
        epfo_code: "DLCPM0091823000",
        esic_code: "11000918230000101",
        message: "EPFO/ESIC registrations verified"
      },
      startup_nsic_oem: {
        startup_india: { required: false, found: false, details: "" },
        nsic: { required: false, found: false, details: "" },
        oem_authorization: { required: false, found: false, details: "" }
      }
    },
    passedChecks: [
      "MSME / Udyam Statutory Registration Verified",
      "GSTN Portal Active Status & Tax Compliance Verified",
      "Income Tax PAN Verified and Active",
      "MSME Exemption Applied for Past Experience (1 yrs)",
      "Financial Turnover Declared & Verified (₹45,00,000.00)",
      "Debarment & Blacklist Screening Cleared (No adverse records found)",
      "EPFO / ESIC Statutory Labor Compliance Verified"
    ],
    failedChecks: [
      "Non-Blacklisting Affidavit / Self-Declaration Missing"
    ],
    aiSummary: "The bid is partially compliant (65/100). MSME, GSTN, and EPFO/ESIC credentials are valid. However, the mandatory notarized Non-Blacklisting Affidavit is missing. Under GeM GTC guidelines, a clarification notice should be issued giving 48 hours for document rectification.",
    officerDecision: "Clarification Requested",
    date: "2026-09-01 17:15:00"
  },
  {
    id: "sample-3",
    name: "Sample 3: High Risk / Non-Compliant Bidder",
    filename: "Sample_3_NonCompliant_QuickVendor.pdf",
    company: "QuickVendor Unregistered Trading Co",
    tenderId: "GEM/2026/B/110293",
    score: 0,
    riskLevel: "High Risk",
    status: "Non-Compliant",
    is_empty_pdf: false,
    parsed: {
      company_name: "QuickVendor Unregistered Trading Co",
      tender_ref_id: "GEM/2026/B/110293",
      years_of_experience: 0,
      turnover_amount: 0,
      has_msme_cert: false,
      gstin: null,
      udyam_no: null,
      pan_no: null,
      has_affidavit: false,
      blacklist_verification: {
        company_name: "QuickVendor Unregistered Trading Co",
        is_blacklisted: false,
        status: "CLEAR",
        message: "No adverse records found"
      },
      epfo_esic: {
        valid: false,
        status: "Missing",
        epfo_code: null,
        esic_code: null,
        message: "EPFO / ESIC statutory registrations not found"
      },
      startup_nsic_oem: {
        startup_india: { required: false, found: false, details: "" },
        nsic: { required: false, found: false, details: "" },
        oem_authorization: { required: false, found: false, details: "" }
      }
    },
    passedChecks: [],
    failedChecks: [
      "MSME Registration Missing or Invalid",
      "GSTN Not Found, Inactive or Invalid Format",
      "PAN Not Found, Inactive or Invalid Format",
      "Insufficient Experience (0 yrs, min requirement: 3 yrs)",
      "Financial Turnover Declaration Not Found",
      "Non-Blacklisting Affidavit / Self-Declaration Missing",
      "EPFO / ESIC Registration Not Verified"
    ],
    aiSummary: "The bid is non-compliant (0/100). Critical statutory prerequisites are unverified. Bidder lacks registered tax entity status, MSME certification, and track record. Immediate technical disqualification is recommended.",
    officerDecision: "Rejected",
    date: "2026-09-01 16:45:00"
  },
  {
    id: "sample-4",
    name: "Sample 4: Debarred / Blacklisted Vendor (0 pts)",
    filename: "Sample_4_Blacklisted_Vendor.pdf",
    company: "ABC Infrastructure Private Limited",
    tenderId: "GEM/2026/B/771924",
    score: 0,
    riskLevel: "High Risk (Debarred)",
    status: "Disqualified - Blacklisted Company",
    is_empty_pdf: false,
    parsed: {
      company_name: "ABC Infrastructure Private Limited",
      tender_ref_id: "GEM/2026/B/771924",
      years_of_experience: 8,
      turnover_amount: 12000000,
      has_msme_cert: true,
      gstin: "27ABCDE1111A1Z1",
      udyam_no: "UDYAM-MH-02-0041235",
      pan_no: "ABCDE1111A",
      has_affidavit: true,
      blacklist_verification: {
        company_name: "ABC Infrastructure Private Limited",
        is_blacklisted: true,
        status: "BLACKLISTED",
        record: {
          company_name: "ABC INFRASTRUCTURE PRIVATE LIMITED",
          pan: "ABCDE1111A",
          reason: "Debarred for non-performance and forged bank guarantees under GeM GTC 7.4",
          debarred_by: "Ministry of Housing and Urban Affairs / GeM Debarment Cell",
          order_no: "MoHUA/PROC/DEB/2024/091",
          valid_until: "2028-12-31"
        },
        message: "CRITICAL: Found in Blacklist Registry (Debarred for non-performance and forged bank guarantees under GeM GTC 7.4)"
      },
      epfo_esic: {
        valid: true,
        status: "Verified",
        epfo_code: "MH/BAN/0041235/000",
        esic_code: "33000412350000101",
        message: "EPFO/ESIC registrations verified"
      },
      startup_nsic_oem: {
        startup_india: { required: false, found: false, details: "" },
        nsic: { required: false, found: false, details: "" },
        oem_authorization: { required: false, found: false, details: "" }
      }
    },
    passedChecks: [
      "MSME / Udyam Statutory Registration Verified",
      "GSTN Portal Active Status & Tax Compliance Verified",
      "Income Tax PAN Verified and Active",
      "EPFO / ESIC Statutory Labor Compliance Verified"
    ],
    failedChecks: [
      "🚨 CRITICAL VIOLATION: Bidder is Blacklisted/Debarred by Ministry of Housing and Urban Affairs / GeM Debarment Cell (Reason: Debarred for non-performance and forged bank guarantees under GeM GTC 7.4)"
    ],
    aiSummary: "CRITICAL DISQUALIFICATION: The bidder is identified on the official Debarment & Blacklist Registry. Pursuant to General Financial Rules (GFR 2017) Rule 151 and GeM General Terms and Conditions Clause 7.4, the bidder is immediately disqualified from technical evaluation.",
    officerDecision: "Rejected",
    date: "2026-09-01 15:30:00"
  },
  {
    id: "sample-5",
    name: "Sample 5: Empty / Blank PDF Document (0 pts)",
    filename: "Sample_5_Blank_Empty.pdf",
    company: "Unknown (Empty Document)",
    tenderId: "GEM/TENDER/EMPTY",
    score: 0,
    riskLevel: "High Risk",
    status: "Rejected - Empty Document",
    is_empty_pdf: true,
    parsed: {
      is_empty: true,
      company_name: "Unknown (Empty Document)",
      tender_ref_id: "GEM/TENDER/EMPTY",
      years_of_experience: 0,
      turnover_amount: 0,
      has_msme_cert: false,
      gstin: null,
      udyam_no: null,
      pan_no: null,
      has_affidavit: false,
      blacklist_verification: {
        company_name: null,
        is_blacklisted: false,
        status: "UNVERIFIABLE",
        message: "Debarment check skipped: Document contains no text."
      },
      epfo_esic: {
        valid: false,
        status: "Missing",
        epfo_code: null,
        esic_code: null,
        message: "EPFO / ESIC registration details not found (Empty Document)"
      },
      startup_nsic_oem: {
        startup_india: { required: false, found: false, details: "Empty file" },
        nsic: { required: false, found: false, details: "Empty file" },
        oem_authorization: { required: false, found: false, details: "Empty file" }
      }
    },
    passedChecks: [],
    failedChecks: [
      "⚠️ Empty Document: The uploaded PDF file is completely blank or contains no readable text.",
      "MSME / Udyam Statutory Registration Missing",
      "GSTN Active Identification Missing",
      "Income Tax PAN Documentation Missing",
      "Technical Past Experience Not Declared",
      "Financial Turnover Records Missing",
      "Non-Blacklisting Affidavit Not Provided",
      "EPFO / ESIC Labor Compliance Not Provided"
    ],
    aiSummary: "CRITICAL REJECTION: The uploaded bid PDF contains no readable text or content (blank document). Pursuant to GeM General Terms and Conditions (GTC Clause 7.1) and GFR 2017 rules, empty submissions cannot be evaluated and are immediately disqualified.",
    officerDecision: "Rejected",
    date: "2026-09-01 14:15:00"
  }
];

export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
};

export const uploadBidPdf = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/upload-pdf/`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
  }

  return await res.json();
};

export const verifyGstn = async (gstin) => {
  const res = await fetch(`${API_BASE_URL}/mock-api/gstn/${encodeURIComponent(gstin)}`);
  return await res.json();
};

export const verifyMsme = async (udyamNo) => {
  const res = await fetch(`${API_BASE_URL}/mock-api/msme/${encodeURIComponent(udyamNo)}`);
  return await res.json();
};

export const verifyPan = async (panNo) => {
  const res = await fetch(`${API_BASE_URL}/mock-api/pan/${encodeURIComponent(panNo)}`);
  return await res.json();
};

export const checkBlacklist = async (query) => {
  const res = await fetch(`${API_BASE_URL}/mock-api/blacklist/${encodeURIComponent(query)}`);
  return await res.json();
};

export const verifyEpfoEsic = async (code) => {
  const res = await fetch(`${API_BASE_URL}/mock-api/epfo-esic/${encodeURIComponent(code)}`);
  return await res.json();
};

export const checkEligibility = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/check-eligibility/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
};

export const getAllEvaluations = async () => {
  const res = await fetch(`${API_BASE_URL}/all-evaluations`);
  if (!res.ok) throw new Error("Failed to fetch evaluations");
  return await res.json();
};

export const updateOfficerDecision = async (recordId, decision, notes) => {
  const res = await fetch(`${API_BASE_URL}/update-decision/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ record_id: recordId, decision, notes })
  });
  return await res.json();
};

export const sendChatQuery = async (question, filename) => {
  const res = await fetch(`${API_BASE_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, filename })
  });
  if (!res.ok) throw new Error("Chat request failed");
  return await res.json();
};

