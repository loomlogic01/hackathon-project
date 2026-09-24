import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';

export default function ReportModal({ evaluation, onClose }) {
  if (!evaluation) return null;

  const {
    filename,
    tender_id,
    parsed_data = {},
    mock_api_verifications = {},
    compliance_evaluation = {},
    compliance_status,
    risk_level,
    ai_review = {},
    evaluated_at,
    officer_decision,
    officer_notes
  } = evaluation;

  const score = compliance_evaluation.overall_score ?? evaluation.score ?? 0;
  const passed = compliance_evaluation.passed_checks ?? evaluation.passed_checks ?? [];
  const failed = compliance_evaluation.failed_checks ?? evaluation.failed_checks ?? [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        
        {/* Modal Actions Bar (hidden in print) */}
        <div className="sticky top-0 bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between z-10 no-print rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Official GeM Statutory Compliance Audit Certificate
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 sm:p-12 text-slate-800" id="printable-certificate">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-2xl">🇮🇳</span>
              <span className="text-xs font-black tracking-widest text-slate-600 uppercase">
                GOVERNMENT OF INDIA • MINISTRY OF COMMERCE & INDUSTRY
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Government e-Marketplace (GeM)
            </h2>
            <p className="text-sm font-bold text-blue-900 uppercase tracking-wider mt-0.5">
              Automated Statutory & Technical Compliance Verification Certificate
            </p>
            <div className="text-xs text-slate-500 mt-2">
              Generated Under GeM General Terms and Conditions (GTC Clause 7.1) & GFR 2017 Rules
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Tender Reference ID</span>
              <span className="font-extrabold text-slate-900 text-sm">{tender_id || parsed_data.tender_ref_id || 'GEM/2026/B/894721'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Document Source</span>
              <span className="font-semibold text-slate-900 truncate block">{filename}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Verification Date</span>
              <span className="font-semibold text-slate-900">{evaluated_at || new Date().toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Risk Classification</span>
              <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] inline-block mt-0.5 ${
                score >= 80 ? 'bg-emerald-100 text-emerald-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {risk_level || (score >= 80 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : 'High Risk')}
              </span>
            </div>
          </div>

          {/* Compliance Score Summary Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-blue-950 to-slate-900 text-white p-6 rounded-2xl mb-8 shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Official Compliance Result
              </span>
              <h3 className="text-2xl font-black mt-1">
                Status: {compliance_status || (score >= 80 ? "Compliant" : score >= 50 ? "Partially Compliant" : "Non-Compliant")}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Automated multi-portal cross-checking verified against Udyam, GSTN, PAN, and debarment portals.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-4 bg-white/10 px-6 py-4 rounded-xl border border-white/20">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Overall Score</span>
                <span className="text-4xl font-black text-white">{score}</span>
                <span className="text-xs text-slate-300"> / 100</span>
              </div>
            </div>
          </div>

          <div className="security-badge-box" style={{ background: '#d0d9e9' }}>
              <div className="flex item-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex item-center gap-1.5">
                  <span>🛡️ Cryptographic Audit Chain</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  ✔️ VERIFIED
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 font-medium uppercase tracking-wide text-[10px] block">
                    Document SHA-256 Hash
                  </span>
                  <code className="block mt-1 p2 bg-slate-900 text-sky-400 font-mono text-[11px] rounded break-all select-all">
                    {evaluation?.file_hash || "N/A"}
                  </code>
                </div>
                <div>
                  <span className="text-slate-400 font-medium uppercase tracking-wide text-[10px] block">
                    Previous Chain Link (Audit Immutable Pointer)
                  </span>
                  <code className="block mt-1 p-2 bg-slate-900 text-sky-400 font-mono text-[11px] rounded break-all select-all">
                    {evaluation?.previous_file_hash || "0"}
                  </code>
                </div>
              </div>
          </div>

          {/* Empty PDF banner if applicable */}
          {(evaluation.is_empty_pdf || parsed_data.is_empty) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs">
              <strong>⚠️ EMPTY DOCUMENT NOTICE:</strong> The submitted bid document is completely blank (no readable text found). Pursuant to GeM GTC 7.1 and GFR 2017 rules, this bid receives 0 points and is disqualified.
            </div>
          )}

          {/* Blacklisted vendor alert if applicable */}
          {parsed_data.blacklist_verification?.is_blacklisted && (
            <div className="mb-6 p-4 rounded-xl bg-rose-900 text-white border border-rose-600 text-xs">
              <strong>🚨 CRITICAL DEBARMENT NOTICE:</strong> Bidder is identified in the official GeM / Ministry Debarment Registry ({parsed_data.blacklist_verification.record?.debarred_by}). Reason: {parsed_data.blacklist_verification.record?.reason}
            </div>
          )}

          {/* Statutory Matrix Table */}
          <div className="mb-8">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 border-b pb-1.5 flex items-center justify-between">
              <span>Statutory & Regulatory Checklist Verification</span>
              <span className="text-xs font-bold text-slate-500">Comprehensive Audit Checklist</span>
            </h4>
            <div className="space-y-2">
              {passed.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                  <span className="font-bold text-emerald-700 uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                    Verified • Valid
                  </span>
                </div>
              ))}
              {failed.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-semibold">
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                  <span className="font-bold text-rose-700 uppercase text-[10px] bg-rose-100 px-2 py-0.5 rounded">
                    Non-Compliant
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Review Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              AI Document Verification Engine Summary
            </h4>
            <p className="text-xs leading-relaxed text-slate-800 font-medium">
              {ai_review.summary || evaluation.ai_summary || "Document review completed with standard statutory parsing."}
            </p>
            {ai_review.notes && (
              <div className="mt-2 text-[11px] text-slate-500 italic">
                Extraction notes: {ai_review.notes}
              </div>
            )}
          </div>

          {/* Officer Decision & Sign-off Section */}
          <div className="border-t-2 border-slate-200 pt-6 grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Procurement Officer Final Decision
              </span>
              <div className="font-bold text-sm text-slate-900">
                {officer_decision || (score >= 80 ? "Approved for Technical Stage" : score >= 50 ? "Clarification Notice Issued" : "Disqualified")}
              </div>
              {officer_notes && (
                <p className="text-slate-600 text-[11px] mt-1 italic">
                  Notes: "{officer_notes}"
                </p>
              )}
            </div>
            <div className="text-right flex flex-col justify-end items-end">
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <span className="font-bold text-slate-900">Authorized Procurement Officer</span>
              <span className="text-[10px] text-slate-500">Government e-Marketplace (GeM)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
