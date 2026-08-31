// ============================================================================
// BidSure AI — Mock Demo Data
// This file simulates the data that will eventually come from the
// Java / Spring Boot backend + AI extraction engine. Structure is kept
// close to what a real REST response would look like so that services/api.js
// can be swapped to real fetch() calls later with minimal changes.
// ============================================================================

export const RISK_THRESHOLDS = {
  HIGH: { min: 0, max: 40, label: "HIGH", color: "fail" },
  MEDIUM: { min: 41, max: 70, label: "MEDIUM", color: "review" },
  LOW: { min: 71, max: 100, label: "LOW", color: "pass" },
};

export function getRiskLevel(score) {
  if (score <= RISK_THRESHOLDS.HIGH.max) return RISK_THRESHOLDS.HIGH;
  if (score <= RISK_THRESHOLDS.MEDIUM.max) return RISK_THRESHOLDS.MEDIUM;
  return RISK_THRESHOLDS.LOW;
}

export const COMPLIANCE_CATALOG = [
  { key: "gst", name: "GST Registration", type: "Mandatory" },
  { key: "pan", name: "PAN", type: "Mandatory" },
  { key: "udyam", name: "Udyam / MSME Registration", type: "Mandatory" },
  { key: "itr", name: "Income Tax Returns", type: "Mandatory" },
  { key: "oem", name: "OEM Authorization", type: "Mandatory" },
  { key: "mii", name: "Make in India Certificate", type: "Mandatory" },
  { key: "epfo", name: "EPFO / ESIC Registration", type: "Conditional" },
  { key: "startup", name: "Startup India Certificate", type: "Optional" },
  { key: "nsic", name: "NSIC Registration", type: "Optional" },
];

// ---------------------------------------------------------------------------
// TENDERS
// ---------------------------------------------------------------------------
export const tenders = [
  {
    id: "GEM-2026-001",
    title: "Supply of Industrial Equipment for Refinery Maintenance",
    organization: "Chennai Petroleum Corporation Limited (CPCL)",
    department: "Ministry of Petroleum & Natural Gas",
    category: "Industrial Equipment & Machinery",
    createdDate: "2026-07-10",
    deadline: "2026-09-05",
    status: "Active",
    bidderCount: 3,
    requirements: [
      {
        key: "gst",
        name: "GST Registration",
        mandatory: true,
        description: "Bidder must hold a valid, active GST registration in India.",
        source: "Tender.pdf",
        page: 5,
        clause: "3.1",
        clauseText: "All bidders shall furnish a valid GST registration certificate as proof of tax compliance.",
      },
      {
        key: "pan",
        name: "PAN",
        mandatory: true,
        description: "Valid Permanent Account Number (PAN) issued by the Income Tax Department.",
        source: "Tender.pdf",
        page: 5,
        clause: "3.2",
        clauseText: "Bidders must submit a copy of their PAN card matching the legal entity name.",
      },
      {
        key: "udyam",
        name: "Udyam / MSME Registration",
        mandatory: true,
        description: "Udyam registration required to avail MSME procurement benefits, where applicable.",
        source: "Tender.pdf",
        page: 6,
        clause: "3.5",
        clauseText: "MSME bidders claiming procurement preference must attach a valid Udyam certificate.",
      },
      {
        key: "itr",
        name: "Income Tax Returns",
        mandatory: true,
        description: "Income Tax Returns for the last 3 financial years.",
        source: "Tender.pdf",
        page: 6,
        clause: "3.6",
        clauseText: "Bidders shall submit ITR acknowledgements for FY 2022-23, 2023-24 and 2024-25.",
      },
      {
        key: "oem",
        name: "OEM Authorization",
        mandatory: true,
        description: "Valid OEM authorization certificate required for equipment supply.",
        source: "Tender.pdf",
        page: 7,
        clause: "4.2",
        clauseText: "Valid OEM authorization is mandatory for bidders supplying branded industrial equipment.",
      },
      {
        key: "mii",
        name: "Make in India Certificate",
        mandatory: true,
        description: "Local content self-certification as per Make in India / PPP-MII Order.",
        source: "Tender.pdf",
        page: 8,
        clause: "4.5",
        clauseText: "Bidders must self-certify local content percentage in accordance with the PPP-MII Order 2017.",
      },
      {
        key: "epfo",
        name: "EPFO / ESIC Registration",
        mandatory: false,
        description: "Required only where the bidder employs more than 20 workers.",
        source: "Tender.pdf",
        page: 9,
        clause: "4.9",
        clauseText: "EPFO/ESIC registration is required for bidders with an eligible workforce as per applicable labour law.",
      },
    ],
  },
  {
    id: "GEM-2026-014",
    title: "Procurement of Safety & Fire-Fighting Equipment",
    organization: "Chennai Petroleum Corporation Limited (CPCL)",
    department: "Ministry of Petroleum & Natural Gas",
    category: "Safety Equipment",
    createdDate: "2026-07-22",
    deadline: "2026-09-18",
    status: "Under Evaluation",
    bidderCount: 2,
    requirements: [
      { key: "gst", name: "GST Registration", mandatory: true, description: "Valid GST registration required.", source: "Tender.pdf", page: 4, clause: "2.1", clauseText: "A valid GST registration certificate is mandatory for all bidders." },
      { key: "pan", name: "PAN", mandatory: true, description: "Valid PAN required.", source: "Tender.pdf", page: 4, clause: "2.2", clauseText: "Bidders shall furnish PAN details matching the bidding entity." },
      { key: "udyam", name: "Udyam / MSME Registration", mandatory: false, description: "Optional; provides MSME procurement preference.", source: "Tender.pdf", page: 5, clause: "2.4", clauseText: "MSME preference will be given upon submission of a valid Udyam certificate." },
      { key: "oem", name: "OEM Authorization", mandatory: true, description: "OEM authorization for fire safety equipment brands.", source: "Tender.pdf", page: 6, clause: "3.1", clauseText: "Bidders must submit OEM authorization for the specific safety equipment quoted." },
      { key: "mii", name: "Make in India Certificate", mandatory: true, description: "Local content certification required.", source: "Tender.pdf", page: 7, clause: "3.4", clauseText: "Self-certification of local content is mandatory as per the applicable MII Order." },
    ],
  },
  {
    id: "GEM-2026-027",
    title: "Annual Maintenance Contract — Instrumentation & Control Systems",
    organization: "Chennai Petroleum Corporation Limited (CPCL)",
    department: "Ministry of Petroleum & Natural Gas",
    category: "AMC Services",
    createdDate: "2026-08-01",
    deadline: "2026-09-30",
    status: "Completed",
    bidderCount: 0,
    requirements: [
      { key: "gst", name: "GST Registration", mandatory: true, description: "Valid GST registration required.", source: "Tender.pdf", page: 3, clause: "1.1", clauseText: "A valid GST registration certificate is mandatory." },
      { key: "pan", name: "PAN", mandatory: true, description: "Valid PAN required.", source: "Tender.pdf", page: 3, clause: "1.2", clauseText: "PAN matching the legal entity name must be submitted." },
      { key: "itr", name: "Income Tax Returns", mandatory: true, description: "ITR for last 3 years.", source: "Tender.pdf", page: 4, clause: "1.5", clauseText: "ITR acknowledgements for the last three financial years must be enclosed." },
    ],
  },
];

// ---------------------------------------------------------------------------
// BIDDERS
// ---------------------------------------------------------------------------
export const bidders = [
  {
    id: "BID-001",
    tenderId: "GEM-2026-001",
    name: "ABC Technologies Pvt Ltd",
    documentsSubmitted: 8,
    documentsRequired: 8,
    complianceScore: 82,
    status: "Under Review",
    lastChecked: "2026-08-26 10:44",
  },
  {
    id: "BID-002",
    tenderId: "GEM-2026-001",
    name: "XYZ Industries",
    documentsSubmitted: 6,
    documentsRequired: 8,
    complianceScore: 61,
    status: "Needs Attention",
    lastChecked: "2026-08-25 16:20",
  },
  {
    id: "BID-003",
    tenderId: "GEM-2026-001",
    name: "Sundaram Engineering Works",
    documentsSubmitted: 8,
    documentsRequired: 8,
    complianceScore: 94,
    status: "Compliant",
    lastChecked: "2026-08-24 12:05",
  },
  {
    id: "BID-004",
    tenderId: "GEM-2026-014",
    name: "Bharat Safety Systems Ltd",
    documentsSubmitted: 5,
    documentsRequired: 5,
    complianceScore: 88,
    status: "Compliant",
    lastChecked: "2026-08-23 09:15",
  },
  {
    id: "BID-005",
    tenderId: "GEM-2026-014",
    name: "Krishna Fire & Safety Traders",
    documentsSubmitted: 3,
    documentsRequired: 5,
    complianceScore: 38,
    status: "Needs Attention",
    lastChecked: "2026-08-22 14:32",
  },
];

// ---------------------------------------------------------------------------
// COMPLIANCE CHECK RESULTS (per bidder)
// status: PASS | REVIEW | FAIL | MISSING
// ---------------------------------------------------------------------------
export const complianceResults = {
  "BID-001": [
    {
      key: "gst",
      requirement: "GST Registration",
      status: "PASS",
      confidence: 98,
      documentName: "GST.pdf",
      reason: "GSTIN extracted and format-validated. Entity name matches bidder registration.",
      extracted: { "GSTIN": "33AACCA1234B1Z5", "Legal Name": "ABC Technologies Pvt Ltd", "State": "Tamil Nadu" },
    },
    {
      key: "pan",
      requirement: "PAN",
      status: "PASS",
      confidence: 97,
      documentName: "PAN.pdf",
      reason: "PAN number extracted and structurally valid. Name matches GST record.",
      extracted: { "PAN": "AACCA1234B", "Name": "ABC Technologies Pvt Ltd" },
    },
    {
      key: "udyam",
      requirement: "Udyam / MSME Registration",
      status: "PASS",
      confidence: 96,
      documentName: "Udyam.pdf",
      reason: "Valid Udyam registration number found with active status.",
      extracted: { "Udyam No.": "UDYAM-TN-03-0045210", "Category": "Small", "Valid Until": "31 Dec 2026" },
    },
    {
      key: "itr",
      requirement: "Income Tax Returns",
      status: "REVIEW",
      confidence: 84,
      documentName: "IncomeTax.pdf",
      reason: "Only 2 of 3 required financial years found in the submitted document. FY 2022-23 acknowledgement is missing or unreadable.",
      extracted: { "FY 2023-24": "Filed", "FY 2024-25": "Filed", "FY 2022-23": "Not detected" },
    },
    {
      key: "oem",
      requirement: "OEM Authorization",
      status: "FAIL",
      confidence: 96,
      documentName: null,
      reason: "Required document was not found in the bidder submission.",
      extracted: {},
    },
    {
      key: "mii",
      requirement: "Make in India Certificate",
      status: "REVIEW",
      confidence: 78,
      documentName: "MII.pdf",
      reason: "Local content percentage stated but self-certification signature block is unclear/partially scanned.",
      extracted: { "Local Content": "52%", "Category": "Class I Local Supplier" },
    },
    {
      key: "epfo",
      requirement: "EPFO / ESIC Registration",
      status: "PASS",
      confidence: 95,
      documentName: "EPFO.pdf",
      reason: "Active EPFO establishment code found.",
      extracted: { "Establishment Code": "TN/CHN/0098234/000", "Status": "Active" },
    },
  ],
  "BID-002": [
    { key: "gst", requirement: "GST Registration", status: "PASS", confidence: 95, documentName: "GST.pdf", reason: "GSTIN extracted and validated.", extracted: { "GSTIN": "27AAECX5678C1Z2" } },
    { key: "pan", requirement: "PAN", status: "PASS", confidence: 93, documentName: "PAN.pdf", reason: "PAN extracted and structurally valid.", extracted: { "PAN": "AAECX5678C" } },
    { key: "udyam", requirement: "Udyam / MSME Registration", status: "MISSING", confidence: 0, documentName: null, reason: "Udyam certificate not submitted by bidder.", extracted: {} },
    { key: "itr", requirement: "Income Tax Returns", status: "FAIL", confidence: 91, documentName: "IncomeTax.pdf", reason: "Only 1 of 3 required years submitted; document appears incomplete.", extracted: { "FY 2024-25": "Filed" } },
    { key: "oem", requirement: "OEM Authorization", status: "REVIEW", confidence: 71, documentName: "OEM.pdf", reason: "OEM letter present but authorization validity date could not be confirmed.", extracted: { "OEM": "Siemens Ltd", "Valid Until": "Unclear" } },
    { key: "mii", requirement: "Make in India Certificate", status: "MISSING", confidence: 0, documentName: null, reason: "Make in India self-certification not found.", extracted: {} },
    { key: "epfo", requirement: "EPFO / ESIC Registration", status: "PASS", confidence: 89, documentName: "EPFO.pdf", reason: "Active establishment code found.", extracted: { "Establishment Code": "MH/PUN/0012345/000" } },
  ],
  "BID-003": [
    { key: "gst", requirement: "GST Registration", status: "PASS", confidence: 99, documentName: "GST.pdf", reason: "GSTIN validated successfully.", extracted: { "GSTIN": "33AACCS9988D1Z1" } },
    { key: "pan", requirement: "PAN", status: "PASS", confidence: 98, documentName: "PAN.pdf", reason: "PAN extracted and matches entity name.", extracted: { "PAN": "AACCS9988D" } },
    { key: "udyam", requirement: "Udyam / MSME Registration", status: "PASS", confidence: 97, documentName: "Udyam.pdf", reason: "Active Udyam registration confirmed.", extracted: { "Udyam No.": "UDYAM-TN-04-0021456" } },
    { key: "itr", requirement: "Income Tax Returns", status: "PASS", confidence: 95, documentName: "IncomeTax.pdf", reason: "All 3 years of ITR acknowledgements found.", extracted: { "FY 2022-23": "Filed", "FY 2023-24": "Filed", "FY 2024-25": "Filed" } },
    { key: "oem", requirement: "OEM Authorization", status: "PASS", confidence: 94, documentName: "OEM.pdf", reason: "Valid OEM authorization letter found with matching validity window.", extracted: { "OEM": "ABB India Ltd", "Valid Until": "31 Mar 2027" } },
    { key: "mii", requirement: "Make in India Certificate", status: "PASS", confidence: 92, documentName: "MII.pdf", reason: "Self-certification found with local content above threshold.", extracted: { "Local Content": "68%" } },
    { key: "epfo", requirement: "EPFO / ESIC Registration", status: "PASS", confidence: 90, documentName: "EPFO.pdf", reason: "Active establishment code confirmed.", extracted: { "Establishment Code": "TN/CBE/0034567/000" } },
  ],
  "BID-004": [
    { key: "gst", requirement: "GST Registration", status: "PASS", confidence: 97, documentName: "GST.pdf", reason: "GSTIN validated.", extracted: { "GSTIN": "29AABCB4455E1Z7" } },
    { key: "pan", requirement: "PAN", status: "PASS", confidence: 96, documentName: "PAN.pdf", reason: "PAN extracted and matches entity.", extracted: { "PAN": "AABCB4455E" } },
    { key: "oem", requirement: "OEM Authorization", status: "PASS", confidence: 93, documentName: "OEM.pdf", reason: "Valid authorization for fire-safety equipment brand.", extracted: { "OEM": "Ceasefire Industries" } },
    { key: "mii", requirement: "Make in India Certificate", status: "REVIEW", confidence: 76, documentName: "MII.pdf", reason: "Local content stated but supporting annexure not attached.", extracted: { "Local Content": "55%" } },
  ],
  "BID-005": [
    { key: "gst", requirement: "GST Registration", status: "REVIEW", confidence: 68, documentName: "GST.pdf", reason: "GSTIN extracted but certificate appears to be an expired/old copy.", extracted: { "GSTIN": "24AAACK1122F1Z9" } },
    { key: "pan", requirement: "PAN", status: "PASS", confidence: 90, documentName: "PAN.pdf", reason: "PAN extracted and valid.", extracted: { "PAN": "AAACK1122F" } },
    { key: "oem", requirement: "OEM Authorization", status: "MISSING", confidence: 0, documentName: null, reason: "OEM authorization not submitted.", extracted: {} },
    { key: "mii", requirement: "Make in India Certificate", status: "MISSING", confidence: 0, documentName: null, reason: "Make in India certificate not submitted.", extracted: {} },
  ],
};

// ---------------------------------------------------------------------------
// MISMATCHES / INCONSISTENCIES
// ---------------------------------------------------------------------------
export const mismatches = {
  "BID-001": [
    {
      id: "MM-1001",
      title: "Company Name Mismatch",
      severity: "MEDIUM",
      docA: { label: "GST Certificate", value: "ABC Technologies Pvt Ltd" },
      docB: { label: "PAN", value: "ABC Technology Pvt Ltd" },
      similarity: 91,
      recommendation: "Review manually before final decision.",
    },
    {
      id: "MM-1002",
      title: "Date Inconsistency",
      severity: "LOW",
      docA: { label: "Udyam Certificate", value: "Valid until 31 Dec 2026" },
      docB: { label: "Submitted Record", value: "30 Jun 2025" },
      similarity: null,
      recommendation: "Confirm the correct validity date with the bidder before scoring this requirement as final.",
    },
  ],
  "BID-002": [
    {
      id: "MM-2001",
      title: "Address Mismatch",
      severity: "MEDIUM",
      docA: { label: "GST Certificate", value: "Plot 14, MIDC Industrial Area, Pune" },
      docB: { label: "PAN Address", value: "Flat 402, Shivaji Nagar, Pune" },
      similarity: 64,
      recommendation: "Registered address differs significantly between documents — verify current business address.",
    },
  ],
  "BID-005": [
    {
      id: "MM-5001",
      title: "GSTIN State Code Mismatch",
      severity: "HIGH",
      docA: { label: "GST Certificate", value: "State Code 24 (Gujarat)" },
      docB: { label: "Bidder Registered Address", value: "State Code 27 (Maharashtra)" },
      similarity: 40,
      recommendation: "State code inconsistency suggests possible document substitution — escalate for manual verification.",
    },
  ],
};

// ---------------------------------------------------------------------------
// RISK BREAKDOWN (score contribution per factor)
// ---------------------------------------------------------------------------
export const riskBreakdown = {
  "BID-001": [
    { factor: "GST", impact: 15 },
    { factor: "PAN", impact: 10 },
    { factor: "Udyam", impact: 15 },
    { factor: "Income Tax", impact: 15 },
    { factor: "OEM Authorization", impact: -15 },
    { factor: "Make in India", impact: -5 },
    { factor: "EPFO", impact: 10 },
    { factor: "Mismatch Penalty", impact: -3 },
  ],
  "BID-002": [
    { factor: "GST", impact: 12 },
    { factor: "PAN", impact: 10 },
    { factor: "Udyam", impact: -10 },
    { factor: "Income Tax", impact: -18 },
    { factor: "OEM Authorization", impact: -5 },
    { factor: "Make in India", impact: -10 },
    { factor: "EPFO", impact: 10 },
    { factor: "Mismatch Penalty", impact: -8 },
  ],
  "BID-003": [
    { factor: "GST", impact: 15 },
    { factor: "PAN", impact: 15 },
    { factor: "Udyam", impact: 15 },
    { factor: "Income Tax", impact: 15 },
    { factor: "OEM Authorization", impact: 15 },
    { factor: "Make in India", impact: 10 },
    { factor: "EPFO", impact: 9 },
  ],
  "BID-004": [
    { factor: "GST", impact: 25 },
    { factor: "PAN", impact: 25 },
    { factor: "OEM Authorization", impact: 25 },
    { factor: "Make in India", impact: 13 },
  ],
  "BID-005": [
    { factor: "GST", impact: 10 },
    { factor: "PAN", impact: 20 },
    { factor: "OEM Authorization", impact: -20 },
    { factor: "Make in India", impact: -20 },
    { factor: "Mismatch Penalty", impact: -12 },
  ],
};

// ---------------------------------------------------------------------------
// AI SUMMARY
// ---------------------------------------------------------------------------
export const aiSummaries = {
  "BID-001": {
    assessment: "Bidder appears substantially compliant but requires manual review before qualification.",
    findings: [
      { type: "PASS", text: "Required GST document found and validated." },
      { type: "PASS", text: "PAN verified against bidder legal name." },
      { type: "PASS", text: "Udyam registration information extracted successfully." },
      { type: "REVIEW", text: "Company name discrepancy detected between GST and PAN documents." },
      { type: "REVIEW", text: "Income Tax Returns missing one of three required financial years." },
      { type: "FAIL", text: "OEM Authorization document not found in submission." },
    ],
    recommendation: "Manual Review Recommended",
  },
  "BID-002": {
    assessment: "Bidder submission has multiple gaps in mandatory documentation and an address inconsistency requiring attention.",
    findings: [
      { type: "PASS", text: "GST and PAN documents verified successfully." },
      { type: "FAIL", text: "Udyam / MSME registration not submitted." },
      { type: "FAIL", text: "Income Tax Returns significantly incomplete (1 of 3 years)." },
      { type: "REVIEW", text: "OEM authorization validity could not be confirmed." },
      { type: "REVIEW", text: "Registered address differs between GST and PAN records." },
    ],
    recommendation: "High Risk — Manual Review Required",
  },
  "BID-003": {
    assessment: "Bidder documentation is complete and consistent across all mandatory compliance requirements.",
    findings: [
      { type: "PASS", text: "All mandatory documents submitted and verified." },
      { type: "PASS", text: "No inconsistencies detected across submitted records." },
      { type: "PASS", text: "OEM authorization and Make in India certification both valid." },
    ],
    recommendation: "Recommended for Qualification — Procurement Officer to confirm",
  },
  "BID-004": {
    assessment: "Bidder is largely compliant; one requirement needs a supporting annexure before it can be finalized.",
    findings: [
      { type: "PASS", text: "GST, PAN and OEM authorization verified." },
      { type: "REVIEW", text: "Make in India local content annexure not attached." },
    ],
    recommendation: "Manual Review Recommended",
  },
  "BID-005": {
    assessment: "Bidder submission is significantly incomplete with a high-severity data inconsistency flagged.",
    findings: [
      { type: "REVIEW", text: "GST certificate may be outdated." },
      { type: "PASS", text: "PAN verified." },
      { type: "FAIL", text: "OEM Authorization not submitted." },
      { type: "FAIL", text: "Make in India certificate not submitted." },
      { type: "REVIEW", text: "GSTIN state code does not match registered address — possible document issue." },
    ],
    recommendation: "High Risk — Manual Review Required",
  },
};

// ---------------------------------------------------------------------------
// DOCUMENTS (Document Center)
// ---------------------------------------------------------------------------
export const documents = [
  { id: "DOC-001", name: "GST.pdf", type: "GST Certificate", bidderId: "BID-001", bidder: "ABC Technologies Pvt Ltd", uploaded: "2026-08-26", extraction: "Complete", verification: "Verified" },
  { id: "DOC-002", name: "PAN.pdf", type: "PAN Card", bidderId: "BID-001", bidder: "ABC Technologies Pvt Ltd", uploaded: "2026-08-26", extraction: "Complete", verification: "Verified" },
  { id: "DOC-003", name: "Udyam.pdf", type: "Udyam Registration", bidderId: "BID-001", bidder: "ABC Technologies Pvt Ltd", uploaded: "2026-08-26", extraction: "Complete", verification: "Verified" },
  { id: "DOC-004", name: "IncomeTax.pdf", type: "Income Tax Return", bidderId: "BID-001", bidder: "ABC Technologies Pvt Ltd", uploaded: "2026-08-26", extraction: "Partial", verification: "Needs Review" },
  { id: "DOC-005", name: "MII.pdf", type: "Make in India Certificate", bidderId: "BID-001", bidder: "ABC Technologies Pvt Ltd", uploaded: "2026-08-26", extraction: "Partial", verification: "Needs Review" },
  { id: "DOC-006", name: "EPFO.pdf", type: "EPFO Registration", bidderId: "BID-001", bidder: "ABC Technologies Pvt Ltd", uploaded: "2026-08-25", extraction: "Complete", verification: "Verified" },
  { id: "DOC-007", name: "GST.pdf", type: "GST Certificate", bidderId: "BID-002", bidder: "XYZ Industries", uploaded: "2026-08-25", extraction: "Complete", verification: "Verified" },
  { id: "DOC-008", name: "PAN.pdf", type: "PAN Card", bidderId: "BID-002", bidder: "XYZ Industries", uploaded: "2026-08-25", extraction: "Complete", verification: "Verified" },
  { id: "DOC-009", name: "IncomeTax.pdf", type: "Income Tax Return", bidderId: "BID-002", bidder: "XYZ Industries", uploaded: "2026-08-25", extraction: "Partial", verification: "Failed" },
  { id: "DOC-010", name: "OEM.pdf", type: "OEM Authorization", bidderId: "BID-002", bidder: "XYZ Industries", uploaded: "2026-08-25", extraction: "Complete", verification: "Needs Review" },
  { id: "DOC-011", name: "GST.pdf", type: "GST Certificate", bidderId: "BID-003", bidder: "Sundaram Engineering Works", uploaded: "2026-08-24", extraction: "Complete", verification: "Verified" },
  { id: "DOC-012", name: "OEM.pdf", type: "OEM Authorization", bidderId: "BID-003", bidder: "Sundaram Engineering Works", uploaded: "2026-08-24", extraction: "Complete", verification: "Verified" },
];

// document-viewer style extraction detail (used by DOC-001 in Document Viewer demo)
export const extractionDetail = {
  "DOC-001": {
    fileLabel: "GST.pdf",
    bidder: "ABC Technologies Pvt Ltd",
    fields: [
      { label: "Company Name", value: "ABC Technologies Pvt Ltd", confidence: 98 },
      { label: "GSTIN", value: "33AACCA1234B1Z5", confidence: 99 },
      { label: "PAN (linked)", value: "AACCA1234B", confidence: 97 },
      { label: "Address", value: "Plot 22, SIDCO Industrial Estate, Chennai, TN 600032", confidence: 95 },
      { label: "Registration Date", value: "14 Mar 2019", confidence: 96 },
      { label: "Expiry Date", value: "Not Applicable (Active)", confidence: 92 },
    ],
  },
};

// ---------------------------------------------------------------------------
// AUDIT TRAIL
// ---------------------------------------------------------------------------
export const auditTrail = [
  { id: "AUD-001", timestamp: "2026-08-26 10:42", user: "Procurement Officer", action: "Uploaded GST.pdf", entity: "ABC Technologies Pvt Ltd", result: "Success" },
  { id: "AUD-002", timestamp: "2026-08-26 10:43", user: "AI Engine", action: "Extracted GSTIN", entity: "ABC Technologies Pvt Ltd", result: "98% confidence" },
  { id: "AUD-003", timestamp: "2026-08-26 10:44", user: "AI Engine", action: "Detected company name mismatch", entity: "ABC Technologies Pvt Ltd", result: "Review required" },
  { id: "AUD-004", timestamp: "2026-08-26 10:44", user: "AI Engine", action: "OEM Authorization not found", entity: "ABC Technologies Pvt Ltd", result: "Flagged FAIL" },
  { id: "AUD-005", timestamp: "2026-08-25 16:20", user: "AI Engine", action: "Computed compliance score", entity: "XYZ Industries", result: "61 / 100" },
  { id: "AUD-006", timestamp: "2026-08-25 16:05", user: "Procurement Officer", action: "Uploaded IncomeTax.pdf", entity: "XYZ Industries", result: "Success" },
  { id: "AUD-007", timestamp: "2026-08-24 12:10", user: "Procurement Officer", action: "Reviewed compliance checklist", entity: "Sundaram Engineering Works", result: "Viewed" },
  { id: "AUD-008", timestamp: "2026-08-24 12:05", user: "AI Engine", action: "Computed compliance score", entity: "Sundaram Engineering Works", result: "94 / 100" },
  { id: "AUD-009", timestamp: "2026-08-22 14:40", user: "AI Engine", action: "Detected GSTIN state code mismatch", entity: "Krishna Fire & Safety Traders", result: "Review required" },
  { id: "AUD-010", timestamp: "2026-08-20 09:00", user: "Procurement Officer", action: "Created tender", entity: "GEM-2026-001", result: "Success" },
];

export function addAuditEntry(entry) {
  auditTrail.unshift({
    id: `AUD-${Math.floor(Math.random() * 90000 + 10000)}`,
    timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    ...entry,
  });
}

// ---------------------------------------------------------------------------
// DASHBOARD KPIs (derived, but kept explicit for demo clarity)
// ---------------------------------------------------------------------------
export const dashboardKpis = {
  activeTenders: 12,
  biddersUnderReview: 38,
  averageCompliance: 84,
  highRiskBidders: 5,
};
