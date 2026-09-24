import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Upload, FileText, CheckCircle2, XCircle, AlertCircle, 
  Sparkles, ShieldCheck, Building, Clock, DollarSign, 
  CreditCard, Check, Send, Download, FileSpreadsheet, Eye
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import VerificationPipeline from './VerificationPipeline';
import ReportModal from './ReportModal';
import { uploadBidPdf, updateOfficerDecision, SAMPLE_BIDS_CATALOG } from '../services/api';

export default function BidEvaluator({ currentEvaluation, setCurrentEvaluation, onEvaluationComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedSample, setSelectedSample] = useState('');
  const [officerDecision, setOfficerDecision] = useState(currentEvaluation?.officer_decision || 'Pending Review');
  const [officerNotes, setOfficerNotes] = useState('');
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

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
      if (onEvaluationComplete) onEvaluationComplete(data);

      if (data.compliance_evaluation?.overall_score >= 80) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload and evaluate PDF. Please ensure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = (sample) => {
    setSelectedSample(sample.id);
    setUploadError(null);
    setDecisionSuccessMsg('');
    
    // Construct sample evaluation object
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
        notes: sample.is_empty_pdf ? "File is empty." : "Catalog sample verified against GeM guidelines.",
        summary: sample.aiSummary
      },
      officer_decision: sample.officerDecision,
      evaluated_at: sample.date
    };

    setCurrentEvaluation(evalData);
    setOfficerDecision(sample.officerDecision);

    if (sample.score >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleDecisionSubmit = async (decision) => {
    setOfficerDecision(decision);
    if (currentEvaluation?.id && currentEvaluation.id !== 999) {
      try {
        await updateOfficerDecision(currentEvaluation.id, decision, officerNotes);
        setDecisionSuccessMsg(`Decision '${decision}' recorded in statutory audit log.`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setDecisionSuccessMsg(`Decision '${decision}' recorded for this session.`);
    }
    setTimeout(() => setDecisionSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Upload & Quick Sample Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Upload Dropzone */}
          <div className="flex-1">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 block">
              1. Upload Bidder Document (PDF)
            </label>
            <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isUploading 
                ? 'bg-blue-50 border-blue-400' 
                : 'hover:bg-slate-50 border-slate-300 hover:border-blue-500'
            }`}>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <span className="text-sm font-bold text-slate-800">
                {isUploading ? 'Extracting & Verifying Document with AI...' : 'Click to Upload or Drag & Drop PDF'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Accepts tender proposals, statutory annexures, Udyam, GST & affidavit PDFs
              </span>
            </label>
          </div>

          {/* Quick Demo Pre-built Bids */}
          <div className="lg:w-96 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
                2. Or Instant Pitch Demo (1-Click Sample Bids)
              </span>
              <div className="space-y-2">
                {uploadError && (
                    <div className="p-3 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                    </div>
                )}

                {SAMPLE_BIDS_CATALOG.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleLoadSample(s)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedSample === s.id
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                        : 'hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold truncate">{s.company}</div>
                      <div className="text-[10px] text-slate-500">Tender: {s.tenderId}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.score >= 80 ? 'bg-emerald-100 text-emerald-800' : s.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.score} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Results View if Evaluation exists */}
      {currentEvaluation ? (
        <div className="space-y-6">
          
          {/* EMPTY DOCUMENT BANNER IF DETECTED */}
          {(currentEvaluation.is_empty_pdf || currentEvaluation.parsed_data?.is_empty) && (
            <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded">
                  EMPTY / BLANK PDF DETECTED
                </span>
                <h3 className="text-base font-black text-rose-900 mt-1">
                  Uploaded Document Contains No Readable Bid Information
                </h3>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed font-medium">
                  The scanned file is completely blank. In accordance with GeM GTC 7.1 and GFR 2017 rules, blank documents are scored <strong>0 / 100</strong> and flagged for automatic disqualification.
                </p>
              </div>
            </div>
          )}

          {/* BLACKLISTED VENDOR CRITICAL BANNER */}
          {currentEvaluation.parsed_data?.blacklist_verification?.is_blacklisted && (
            <div className="p-6 rounded-2xl bg-rose-950 border-2 border-rose-600 text-white shadow-lg flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded">
                  🚨 CRITICAL RISK: DEBARRED / BLACKLISTED VENDOR
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  {currentEvaluation.parsed_data?.blacklist_verification?.company_name || currentEvaluation.filename} is Listed on Central Debarment Database
                </h3>
                <p className="text-xs text-rose-200 mt-0.5 font-medium">
                  {currentEvaluation.parsed_data?.blacklist_verification?.record?.reason || currentEvaluation.parsed_data?.blacklist_verification?.message}
                </p>
              </div>
            </div>
          )}

          {/* Verification Pipeline Tracker */}
          <VerificationPipeline step={5} />

          {/* Core Evaluation Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Score & Risk Gauge */}
            <div className="flex flex-col gap-4">
              <ScoreGauge
                score={currentEvaluation.compliance_evaluation?.overall_score ?? currentEvaluation.score ?? 0}
                riskLevel={currentEvaluation.risk_level || (currentEvaluation.score >= 80 ? 'Low Risk' : currentEvaluation.score >= 50 ? 'Medium Risk' : 'High Risk')}
                status={currentEvaluation.compliance_status || (currentEvaluation.score >= 80 ? 'Compliant' : currentEvaluation.score >= 50 ? 'Partially Compliant' : 'Non-Compliant')}
              />

              {/* Document Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft text-xs space-y-3">
                <h4 className="font-black uppercase tracking-wider text-slate-500 border-b pb-2">
                  Document Metadata
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Name:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[160px]" title={currentEvaluation.filename}>
                    {currentEvaluation.filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tender Reference:</span>
                  <span className="font-bold text-blue-900">
                    {currentEvaluation.tender_id || currentEvaluation.parsed_data?.tender_ref_id || "GEM/2026/B/894721"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Audit Timestamp:</span>
                  <span className="font-medium text-slate-700">
                    {currentEvaluation.evaluated_at || new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2 & 3: Statutory Check Matrix & AI Insights */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* AI Verification Review Card */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl text-white p-6 shadow-md border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <span className="font-extrabold text-sm tracking-wide text-white">
                      AI Review Engine Verdict (Llama 3.1)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Audited for GTC 7.1
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentEvaluation.ai_review?.summary || currentEvaluation.ai_summary || "Document parsed and evaluated successfully against statutory criteria."}
                </p>

                {currentEvaluation.ai_review?.notes && (
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <span className="font-bold text-slate-300">Extraction Verifier:</span>
                    <span>{currentEvaluation.ai_review.notes}</span>
                  </div>
                )}
              </div>

              {/* Statutory Checks Breakdown Matrix */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Statutory Compliance Matrix
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    5 Critical Evaluation Pillars (100 Total Pts)
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Passed Checks */}
                  {(currentEvaluation.compliance_evaluation?.passed_checks ?? currentEvaluation.passed_checks ?? []).map((check, idx) => (
                    <div
                      key={`pass-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-emerald-950 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{check}</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded text-[11px] whitespace-nowrap">
                        +20 Pts • Valid
                      </span>
                    </div>
                  ))}

                  {/* Failed Checks */}
                  {(currentEvaluation.compliance_evaluation?.failed_checks ?? currentEvaluation.failed_checks ?? []).map((check, idx) => (
                    <div
                      key={`fail-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-rose-950 font-semibold">
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{check}</span>
                      </div>
                      <span className="font-extrabold text-rose-700 bg-rose-100 px-2.5 py-1 rounded text-[11px] whitespace-nowrap">
                        0 Pts • Missing / Non-Compliant
                      </span>
                    </div>
                  ))}
                </div>

                {/* Parsed Attributes Comparison Grid */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">MSME / Udyam No</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {currentEvaluation.parsed_data?.udyam_no || (currentEvaluation.parsed_data?.has_msme_cert ? "Udyam Declared" : "Not Provided")}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                      {currentEvaluation.mock_api_verifications?.msme_verification?.valid ? "● Portal Active" : "○ Unverified"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">GSTIN Identification</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {currentEvaluation.parsed_data?.gstin || "Not Provided"}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                      {currentEvaluation.mock_api_verifications?.gstn_verification?.valid ? "● GSTN Verified" : "○ Unverified"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Income Tax PAN</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {currentEvaluation.parsed_data?.pan_no || "Not Provided"}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                      {currentEvaluation.mock_api_verifications?.pan_verification?.valid ? "● Active Entity" : "○ Unverified"}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${currentEvaluation.parsed_data?.blacklist_verification?.is_blacklisted ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Blacklist Screening</span>
                    <span className={`font-bold block truncate ${currentEvaluation.parsed_data?.blacklist_verification?.is_blacklisted ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {currentEvaluation.parsed_data?.blacklist_verification?.is_blacklisted ? "🚨 BLACKLISTED" : "● CLEARED"}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                      {currentEvaluation.parsed_data?.blacklist_verification?.is_blacklisted ? "Found in GeM Registry" : "No adverse records"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">EPFO Code</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {currentEvaluation.parsed_data?.epfo_esic?.epfo_code || "Not Provided"}
                    </span>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${currentEvaluation.parsed_data?.epfo_esic?.epfo_code ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {currentEvaluation.parsed_data?.epfo_esic?.epfo_code ? "● EPFO Active" : "○ Missing"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">ESIC Registration</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {currentEvaluation.parsed_data?.epfo_esic?.esic_code || "Not Provided"}
                    </span>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${currentEvaluation.parsed_data?.epfo_esic?.esic_code ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {currentEvaluation.parsed_data?.epfo_esic?.esic_code ? "● ESIC Active" : "○ Missing"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Startup / NSIC</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.details || (currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.found ? "Startup Recognized" : (currentEvaluation.parsed_data?.startup_nsic_oem?.nsic?.details || "Not Claimed"))}
                    </span>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.found ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {currentEvaluation.parsed_data?.startup_nsic_oem?.startup_india?.found ? "● DPIIT Recognized" : "○ Standard"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">OEM Authorization</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.details || (currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.found ? "OEM Authorized" : "Not Attached")}
                    </span>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.found ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {currentEvaluation.parsed_data?.startup_nsic_oem?.oem_authorization?.found ? "● MAF Attached" : "○ Reseller/Direct"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Track Record Experience</span>
                    <span className="font-bold text-slate-800">
                      {currentEvaluation.parsed_data?.years_of_experience ?? 0} Years
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Financial Turnover</span>
                    <span className="font-bold text-slate-800">
                      ₹{(currentEvaluation.parsed_data?.turnover_amount ?? 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Affidavit Declaration</span>
                    <span className="font-bold text-slate-800">
                      {currentEvaluation.parsed_data?.has_affidavit ? "Submitted" : "Missing"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Make in India</span>
                    <span className="font-bold text-slate-800">
                      {currentEvaluation.parsed_data?.make_in_india?.local_content_percentage ? `${currentEvaluation.parsed_data.make_in_india.local_content_percentage}% Local Content` : "Not Declared"}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Procurement Officer Decision & Action Deck */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-elevated border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Procurement Officer Authority Hub
                </span>
                <h3 className="text-lg font-black text-white">
                  Record Official Qualification Decision
                </h3>
                <p className="text-xs text-slate-400">
                  AI provides decision support; statutory authority remains exclusively with the Procurement Officer.
                </p>
              </div>

              {/* View/Print Certificate button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Eye className="w-4 h-4 text-blue-400" />
                <span>View Full Compliance Certificate</span>
              </button>
            </div>

            {decisionSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{decisionSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleDecisionSubmit('Approved')}
                className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  officerDecision === 'Approved'
                    ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/50 shadow-md'
                    : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Bidder (Qualify)</span>
              </button>

              <button
                onClick={() => handleDecisionSubmit('Clarification Requested')}
                className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  officerDecision === 'Clarification Requested'
                    ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                    : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Issue Clarification Notice</span>
              </button>

              <button
                onClick={() => handleDecisionSubmit('Rejected')}
                className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  officerDecision === 'Rejected'
                    ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-400/50 shadow-md'
                    : 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Disqualify Bid</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No Bid Document Evaluated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Upload a tender PDF above or click one of the pre-built pitch demo samples to see the AI statutory verification engine in action.
          </p>
        </div>
      )}

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
