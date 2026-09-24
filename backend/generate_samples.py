import os

def create_simple_pdf(filename, text_content):
    """
    Creates a valid standard PDF 1.4 file with text without external libraries.
    """
    lines = text_content.strip().split('\n')
    
    # Build PDF stream
    stream_content = "BT\n/F1 12 Tf\n50 750 Td\n16 TL\n"
    for line in lines:
        escaped = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        stream_content += f"({escaped}) '\n"
    stream_content += "ET\n"
    
    stream_bytes = stream_content.encode('latin1')
    stream_len = len(stream_bytes)
    
    pdf_template = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length {stream_len} >>
stream
{stream_content}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
380
%%EOF"""

    with open(filename, "wb") as f:
        f.write(pdf_template.encode('latin1'))
    print(f"Generated sample PDF: {filename}")


def generate_all_samples():
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_bids")
    os.makedirs(sample_dir, exist_ok=True)
    
    # Sample 1: Compliant Micro-Enterprise Bidder (All criteria passed)
    s1_text = """GOVERNMENT E-MARKETPLACE (GeM) - BID SUBMISSION DOCUMENT
Tender Reference ID: GEM/2026/B/894721
Company Name: TechnoCorp Solutions Pvt Ltd
Registration Details:
- MSME Registration: Udyam Micro Enterprise
- Udyam Number: UDYAM-KR-03-0028194
- GSTIN: 29ABCDE1234F1Z5
- Income Tax PAN: ABCDE1234F
- EPFO Registration Code: KN/BNG/0028194/000
- ESIC Registration Number: 31000281940000101

Statutory & Policy Declarations:
- Startup India Recognition: DIPP98214
- OEM Authorization: OEM Authorization Letter Ref: OEM/HP/2026/894
- Make in India Local Content: 65% Local Content
- Experience: 4 years of experience in supplying IT hardware and systems.
- Financial Turnover: INR 85,00,000 Sales for the preceding financial year.
- Non-Blacklisting Declaration: We hereby submit our notarized Non-Blacklisting Affidavit.
- Debarment Screening: Not debarred or blacklisted by any Government Ministry or CPSE.
Authorized Signatory: TechnoCorp Solutions India Pvt Ltd."""
    create_simple_pdf(os.path.join(sample_dir, "Sample_1_Compliant_TechnoCorp.pdf"), s1_text)

    # Sample 2: Partial Compliance (Missing Experience & Affidavit)
    s2_text = """GOVERNMENT E-MARKETPLACE (GeM) - BID SUBMISSION
Tender ID: GEM/2026/B/451920
Bidder Name: Apex Infra Services
Statutory Details:
- MSME Certificate: Micro Enterprise Registered
- Udyam Registration No: UDYAM-DL-01-0091823
- GSTIN Number: 07AAAAA0000A1Z5
- PAN Card: AAAAA0000A
- EPFO Code: DLCPM0091823000
- ESIC Code: 11000918230000101
- Experience: 1 years of experience in facility management.
- Turnover: INR 45,00,000 Revenue
Note: Non-blacklisting declaration affidavit is currently pending notarization."""
    create_simple_pdf(os.path.join(sample_dir, "Sample_2_Partial_ApexInfra.pdf"), s2_text)

    # Sample 3: High Risk / Non-Compliant Bidder
    s3_text = """TENDER BID PROPOSAL - GeM PORTAL
Tender Reference: GEM/2026/B/110293
Bidder Name: QuickVendor Unregistered Trading Co
Entity Details:
- MSME: No certificate provided
- Tax ID: Incomplete tax documentation
- Experience: 0 years of experience
- Financials: New startup without audited turnover
- Non-Blacklisting Affidavit: Not submitted."""
    create_simple_pdf(os.path.join(sample_dir, "Sample_3_NonCompliant_QuickVendor.pdf"), s3_text)

    # Sample 4: Blacklisted / Debarred Company
    s4_text = """GOVERNMENT E-MARKETPLACE (GeM) - BID SUBMISSION
Tender Reference ID: GEM/2026/B/771924
Bidder Name: ABC Infrastructure Private Limited
Registration Details:
- MSME Registration: UDYAM-MH-02-0041235
- GSTIN: 27ABCDE1111A1Z1
- Income Tax PAN: ABCDE1111A
- EPFO Registration Code: MH/BAN/0041235/000
- ESIC Registration Number: 33000412350000101
- Experience: 8 years of experience
- Turnover: INR 1,20,00,000 Sales
- Non-Blacklisting Affidavit: Self-declaration submitted."""
    create_simple_pdf(os.path.join(sample_dir, "Sample_4_Blacklisted_Vendor.pdf"), s4_text)

    # Sample 5: Empty / Blank PDF Document
    create_simple_pdf(os.path.join(sample_dir, "Sample_5_Blank_Empty.pdf"), "")

if __name__ == "__main__":
    generate_all_samples()
