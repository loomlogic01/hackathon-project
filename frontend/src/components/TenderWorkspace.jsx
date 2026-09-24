import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Upload, FileText, CheckCircle2, XCircle, AlertCircle, 
  Sparkles, ShieldCheck, Check, Send, Eye, ArrowRight, X, AlertTriangle
} from 'lucide-react';
import ReportModal from './ReportModal';
import { uploadBidPdf, updateOfficerDecision, SAMPLE_BIDS_CATALOG } from '../services/api';

export default function TenderWorkspace({ 
  currentEvaluation, 
  setCurrentEvaluation, 
  evaluationsList = [], 
  onEvaluationUpdated 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [officerDecision, setOfficerDecision] = useState(currentEvaluation?.officer_decision || 'Pending Review');
  const [officerNotes, setOfficerNotes] = useState('');
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const API_BASE_URL = "https://gem-bid-compliance-1.onrender.com";

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setDecisionSuccessMsg('');

    try {
      const data = await uploadBidPdf(file);
      setCurrentEvaluation(data);
      setOfficerDecision('Pending Review');
      if (onEvaluationUpdated) onEvaluationUpdated(data);

      if (data.compliance_evaluation?.overall_score >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to evaluate PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setUploadError(null);
    setDecisionSuccessMsg('');
    
    const evalData = {
      filename: sample.filename,
      id: sample.id === 'sample-1' ? 1 : sample.id === 'sample-2' ? 2 : sample.id === 'sample-3' ? 3 : sample.id === 'sample-4' ? 4 : 5,
      tender_id: sample.tenderId,
      risk_level: sample.riskLevel,
      is_empty_pdf: Boolean(sample.is_empty_pdf),
      parsed_data: sample.parsed,
      mock_api_verifications: {
        gstn_verification: { valid: Boolean(sample.parsed.gstin), message: sample.parsed.gstin ? "Verified Active" : "Not Found" },
        msme_verification: { valid: Boolean(sample.parsed.udyam_no), message: sample.parsed.udyam_no ? "Verified Micro Enterprise" : "Not Found" },
        pan_verification: { valid: Boolean(sample.parsed.pan_no), message: sample.parsed.pan_no ? "Verified Legal Entity" : "Not Found" }
      },
      compliance_evaluation: {
        overall_score: sample.score,
        passed_checks: sample.passedChecks,
        failed_checks: sample.failedChecks
      },
      compliance_status: sample.status,
      ai_review: {
        extraction_looks_correct: !sample.is_empty_pdf,
        notes: sample.is_empty_pdf ? "File is empty or contains no extractable text." : "Catalog sample verified against GeM statutory rules.",
        summary: sample.aiSummary
      },
      officer_decision: sample.officerDecision,
      evaluated_at: sample.date
    };

    setCurrentEvaluation(evalData);
    setOfficerDecision(sample.officerDecision);

    if (sample.score >= 80) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleDecisionSubmit = async (decision) => {
    setOfficerDecision(decision);
    if (currentEvaluation?.id) {
      try {
        await updateOfficerDecision(currentEvaluation.id, decision, officerNotes);
        setDecisionSuccessMsg(`Decision updated: Bid '${decision}' by Procurement Officer.`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setDecisionSuccessMsg(`Decision updated: Bid '${decision}' for this session.`);
    }
    setTimeout(() => setDecisionSuccessMsg(''), 4000);
  };

  const score = currentEvaluation?.compliance_evaluation?.overall_score ?? currentEvaluation?.score ?? 0;
  const isEmptyPdf = Boolean(currentEvaluation?.is_empty_pdf || currentEvaluation?.parsed_data?.is_empty);
  const isBlacklisted = Boolean(currentEvaluation?.parsed_data?.blacklist_verification?.is_blacklisted);
  const blacklistInfo = currentEvaluation?.parsed_data?.blacklist_verification;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Master Column (Left 4 cols): Bids List & Upload Area */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Upload Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-3">
            Upload Bidder PDF
          </h2>
          <label className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isUploading ? 'bg-blue-50 border-blue-400' : 'hover:bg-slate-50 border-slate-300 hover:border-blue-500'
          }`}>
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 shadow-xs">
              {isUploading ? (
                <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-bold text-slate-800 text-center">
              {isUploading ? 'Verifying with AI Engine...' : 'Click to Upload Tender PDF'}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Automated statutory extraction</span>
          </label>
        </div>

        {/* Submissions Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Select Bid to Evaluate
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
              {SAMPLE_BIDS_CATALOG.length} Submissions
            </span>
          </div>

          <div className="space-y-2.5">
            {SAMPLE_BIDS_CATALOG.map((s) => {
              const isSelected = currentEvaluation?.filename === s.filename;

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 text-sm mb-1">
                    <span className="truncate">{s.company}</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                      s.score >= 80 ? 'bg-emerald-100 text-emerald-800' : s.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.score} Pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">{s.tenderId}</span>
                    <span className={`font-semibold ${s.status?.includes('Blacklisted') || s.status?.includes('Empty') ? 'text-rose-700' : 'text-slate-700'}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {uploadError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

      </div>

      {/* Detail Column (Right 8 cols): Focused Review Desk */}
      <div className="lg:col-span-8 space-y-6">
        
        {currentEvaluation ? (
          <>
            {/* EMPTY DOCUMENT BANNER IF DETECTED */}
            {isEmptyPdf && (
              <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded">
                        EMPTY / BLANK PDF DETECTED
                      </span>
                      <span className="text-xs font-bold text-rose-700">0 Points Awarded</span>
                    </div>
                    <h3 className="text-lg font-black text-rose-900 mt-1">
                      Uploaded Bid Document is Completely Empty
                    </h3>
                    <p className="text-xs text-rose-800 mt-1 font-medium leading-relaxed">
                      The AI extraction engine scanned the submitted PDF but found no text or statutory records. In accordance with GeM General Terms and Conditions (GTC Clause 7.1) and GFR 2017 rules, blank documents receive an automatic score of <strong>0 / 100</strong> and must be disqualified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* BLACKLIST STATUS ALERT BANNER */}
            {isBlacklisted && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 to-slate-900 text-white border-2 border-rose-500 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-1 rounded">
                        🚨 CRITICAL RISK: DEBARRED / BLACKLISTED VENDOR
                      </span>
                      <span className="text-xs font-bold text-rose-300">GFR 2017 Rule 151</span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-1.5">
                      {blacklistInfo?.company_name || currentEvaluation.filename} is Listed on Central Debarment Database
                    </h3>
                    <p className="text-xs text-rose-200 mt-1 font-medium">
                      {blacklistInfo?.record?.reason || blacklistInfo?.message}
                    </p>
                    <div className="mt-3 pt-3 border-t border-rose-800/80 text-xs text-rose-300 flex flex-wrap gap-4">
                      {blacklistInfo?.record?.debarred_by && (
                        <div>Debarring Authority: <strong className="text-white">{blacklistInfo.record.debarred_by}</strong></div>
                      )}
                      {blacklistInfo?.record?.order_no && (
                        <div>Order Ref: <strong className="text-white">{blacklistInfo.record.order_no}</strong></div>
                      )}
                      {blacklistInfo?.record?.valid_until && (
                        <div>Debarment Period: <strong className="text-white">Active until {blacklistInfo.record.valid_until}</strong></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Bid Header & Instant Officer Actions Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-900">
                      Tender Ref: {currentEvaluation.tender_id || currentEvaluation.parsed_data?.tender_ref_id || 'GEM/2026/B/894721'}
                    </span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded ${
                      isBlacklisted || isEmptyPdf
                        ? 'bg-rose-100 text-rose-800'
                        : score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {currentEvaluation.risk_level || (score >= 80 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : 'High Risk')}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {currentEvaluation.parsed_data?.company_name || currentEvaluation.filename}
                  </h1>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    File: <span className="font-semibold text-slate-700">{currentEvaluation.filename}</span> • Evaluated: {currentEvaluation.evaluated_at || 'Just now'}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs uppercase font-extrabold text-slate-400">Compliance Score</div>
                    <div className="text-4xl font-black text-slate-900">
                      {score}
                      <span className="text-sm font-bold text-slate-400"> / 100</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-3 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-200 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Eye size={16} color="#2563eb" />
                    <span>Certificate</span>
                  </button>
                </div>
              </div>

              {/* PROMINENT OFFICER DECISION ACTION BAR (TOP OF CARD) */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Officer Qualification Actions (One-Click Decision)
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                    officerDecision === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : officerDecision === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    Decision: {officerDecision}
                  </span>
                </div>

                {decisionSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{decisionSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* APPROVE BUTTON */}
                  <button
                    onClick={() => handleDecisionSubmit('Approved')}
                    disabled={isBlacklisted || isEmptyPdf}
                    className={`p-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      isBlacklisted || isEmptyPdf
                        ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                        : officerDecision === 'Approved'
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Qualify</span>
                  </button>

                  {/* CLARIFICATION BUTTON */}
                  <button
                    onClick={() => handleDecisionSubmit('Clarification Requested')}
                    className={`p-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      officerDecision === 'Clarification Requested'
                        ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md'
                        : 'bg-amber-700 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Issue Clarification</span>
                  </button>

                  {/* REJECT BUTTON (HIGH VISIBILITY) */}
                  <button
                    onClick={() => handleDecisionSubmit('Rejected')}
                    className={`p-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      officerDecision === 'Rejected'
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-md'
                        : 'bg-rose-700 hover:bg-rose-600 text-white'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject / Disqualify</span>
                  </button>
                </div>
              </div>

              {/* Mandatory Statutory Checklist */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Mandatory Statutory & Regulatory Checklist (GeM GTC 7.1)</span>
                  <span className="text-xs text-slate-500 font-bold">Comprehensive Statutory Audit (100 Pts Max)</span>
                </div>

                {/* Passed items */}
                {(currentEvaluation.compliance_evaluation?.passed_checks ?? currentEvaluation.passed_checks ?? []).map((check, idx) => (
                  <div key={`p-${idx}`} className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-sm">
                    <div className="flex items-center gap-3 text-emerald-950 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>{check}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded">
                      Verified • Valid
                    </span>
                  </div>
                ))}

                {/* Failed items */}
                {(currentEvaluation.compliance_evaluation?.failed_checks ?? currentEvaluation.failed_checks ?? []).map((check, idx) => (
                  <div key={`f-${idx}`} className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-sm">
                    <div className="flex items-center gap-3 text-rose-950 font-bold">
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                      <span>{check}</span>
                    </div>
                    <span className="text-xs font-black text-rose-800 bg-rose-100 px-3 py-1 rounded">
                      Non-Compliant
                    </span>
                  </div>
                ))}
              </div>

              {/* Extracted Attributes Grid */}
              <div className="pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
                {/* MSME */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">MSME / Udyam</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {currentEvaluation.parsed_data?.udyam_no || (currentEvaluation.parsed_data?.has_msme_cert ? "Udyam Declared" : "Missing")}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 block mt-1">
                    {currentEvaluation.mock_api_verifications?.msme_verification?.valid ? "● Portal Active" : "○ Unverified"}
                  </span>
                </div>

                {/* GSTIN */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">GSTIN</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {currentEvaluation.parsed_data?.gstin || "Missing"}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 block mt-1">
                    {currentEvaluation.mock_api_verifications?.gstn_verification?.valid ? "● GSTN Verified" : "○ Unverified"}
                  </span>
                </div>

                {/* PAN */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">Income Tax PAN</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {currentEvaluation.parsed_data?.pan_no || "Missing"}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 block mt-1">
                    {currentEvaluation.mock_api_verifications?.pan_verification?.valid ? "● PAN Active" : "○ Unverified"}
                  </span>
                </div>

                {/* Blacklist / Debarment Status */}
                <div className={`p-3 rounded-xl border ${isBlacklisted ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">Blacklist Screening</span>
                  <span className={`font-extrabold text-xs block ${isBlacklisted ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {isBlacklisted ? "🚨 BLACKLISTED" : "● CLEARED"}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1 truncate">
                    {isBlacklisted ? "Found on GeM list" : "No adverse records"}
                  </span>
                </div>

                {/* EPFO Code */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">EPFO Registration</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {currentEvaluation.parsed_data?.epfo_esic?.epfo_code || "Not Found"}
                  </span>
                  <span className={`text-[10px] font-semibold block mt-1 ${currentEvaluation.parsed_data?.epfo_esic?.epfo_code ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {currentEvaluation.parsed_data?.epfo_esic?.epfo_code ? "● EPFO Active" : "○ Missing"}
                  </span>
                </div>

                {/* ESIC Code */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">ESIC Insurance</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {currentEvaluation.parsed_data?.epfo_esic?.esic_code || "Not Found"}
                  </span>
                  <span className={`text-[10px] font-semibold block mt-1 ${currentEvaluation.parsed_data?.epfo_esic?.esic_code ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {currentEvaluation.parsed_data?.epfo_esic?.esic_code ? "● ESIC Active" : "○ Missing"}
                  </span>
                </div>

                {/* Startup India / NSIC */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">Startup / NSIC</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.details || (currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.found ? "Startup Recognized" : (currentEvaluation.parsed_data?.startup_nsic_oem?.nsic?.details || "Not Applicable"))}
                  </span>
                  <span className={`text-[10px] font-semibold block mt-1 ${currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.found || currentEvaluation.parsed_data?.startup_nsic_oem?.nsic?.found ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.found ? "● DPIIT Recognized" : "○ Standard Vendor"}
                  </span>
                </div>

                {/* OEM Authorization */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">OEM Authorization</span>
                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                    {currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.details || (currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.found ? "OEM Authorized" : "Not Provided")}
                  </span>
                  <span className={`text-[10px] font-semibold block mt-1 ${currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.found ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.found ? "● MAF Attached" : "○ Reseller/Direct"}
                  </span>
                </div>

                {/* Experience */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">Experience</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {currentEvaluation.parsed_data?.years_of_experience ?? 0} Years
                  </span>
                </div>

                {/* Turnover */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">Turnover</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    ₹{(currentEvaluation.parsed_data?.turnover_amount ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Non-Blacklisting Affidavit */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">Affidavit Declaration</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {currentEvaluation.parsed_data?.has_affidavit ? "Submitted" : "Missing"}
                  </span>
                </div>

                {/* Make in India */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-bold uppercase block mb-1">Make in India</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {currentEvaluation.parsed_data?.make_in_india?.local_content_percentage ? `${currentEvaluation.parsed_data.make_in_india.local_content_percentage}% Local Content` : "Not Declared"}
                  </span>
                </div>

              </div>

            </div>

            {/* AI Review Summary Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="font-black text-sm tracking-wide text-white uppercase">
                    AI Review & Recommendation (Llama 3.1)
                  </span>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full font-bold">
                  GFR 2017 & GTC 7.1 Verified
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-200 font-medium">
                {currentEvaluation.ai_review?.summary || currentEvaluation.ai_summary || "Document parsed and evaluated against standard statutory criteria."}
              </p>
              {currentEvaluation.ai_review?.notes && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <span className="font-bold text-slate-300">Extraction Notes:</span> {currentEvaluation.ai_review.notes}
                </div>
              )}
            </div>

          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">Select a Bid to Review</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Pick a bid from the queue on the left or upload a tender PDF to launch the AI verification engine.
            </p>
          </div>
        )}

      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          evaluation={currentEvaluation}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
}
