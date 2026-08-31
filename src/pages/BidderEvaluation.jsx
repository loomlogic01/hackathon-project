import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileQuestion,
  Sparkles,
  ShieldAlert,
  Info,
  GitCompareArrows,
} from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import ComplianceScore from "../components/ComplianceScore";
import ComplianceTable from "../components/ComplianceTable";
import EvidencePanel from "../components/EvidencePanel";
import RiskChart from "../components/RiskChart";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { LoadingState, EmptyState } from "../components/EmptyState";
import {
  getBidderById,
  getTenderById,
  getComplianceResults,
  getMismatches,
  getRiskBreakdown,
  getAiSummary,
  submitFinalDecision,
} from "../services/api";

const FINDING_ICON = { PASS: CheckCircle2, REVIEW: AlertTriangle, FAIL: XCircle };
const FINDING_COLOR = { PASS: "text-pass-600", REVIEW: "text-review-600", FAIL: "text-fail-600" };

export default function BidderEvaluation() {
  const { bidderId } = useParams();
  const navigate = useNavigate();

  const [bidder, setBidder] = useState(undefined);
  const [tender, setTender] = useState(null);
  const [results, setResults] = useState(null);
  const [mismatchList, setMismatchList] = useState(null);
  const [risk, setRisk] = useState(null);
  const [summary, setSummary] = useState(null);

  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(null);

  const [decisionModal, setDecisionModal] = useState(null); // "Approve" | "Reject" | "Review" | null
  const [confirmed, setConfirmed] = useState(false);
  const [finalDecision, setFinalDecision] = useState(null);

  useEffect(() => {
    getBidderById(bidderId).then((b) => {
      setBidder(b);
      if (b) getTenderById(b.tenderId).then(setTender);
    });
    getComplianceResults(bidderId).then(setResults);
    getMismatches(bidderId).then(setMismatchList);
    getRiskBreakdown(bidderId).then(setRisk);
    getAiSummary(bidderId).then(setSummary);
  }, [bidderId]);

  const counts = useMemo(() => {
    if (!results) return { PASS: 0, REVIEW: 0, FAIL: 0, MISSING: 0 };
    return results.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { PASS: 0, REVIEW: 0, FAIL: 0, MISSING: 0 }
    );
  }, [results]);

  function openEvidence(result) {
    setActiveResult(result);
    setEvidenceOpen(true);
  }

  function requirementMetaFor(key) {
    return tender?.requirements?.find((r) => r.key === key);
  }

  async function handleDecisionConfirm() {
    await submitFinalDecision(bidderId, decisionModal, "");
    setFinalDecision(decisionModal);
    setDecisionModal(null);
    setConfirmed(false);
  }

  if (bidder === undefined) {
    return (
      <AppLayout title="Bidder Evaluation">
        <LoadingState label="Loading bidder evaluation…" />
      </AppLayout>
    );
  }

  if (!bidder) {
    return (
      <AppLayout title="Bidder Evaluation">
        <EmptyState title="Bidder not found" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={bidder.name} subtitle={`Tender: ${bidder.tenderId} · Bid Compliance Evaluation`}>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 mb-4"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* HEADER: Score + Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-card p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Overall Compliance Score</p>
          <ComplianceScore score={bidder.complianceScore} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Bidder</p>
              <h2 className="text-lg font-bold text-slate-900">{bidder.name}</h2>
            </div>
            {finalDecision ? (
              <StatusBadge
                status={finalDecision === "Approve" ? "Compliant" : finalDecision === "Reject" ? "Needs Attention" : "Under Review"}
              />
            ) : (
              <StatusBadge status={bidder.status} />
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={CheckCircle2} color="pass" label="Passed" value={counts.PASS} />
            <SummaryCard icon={AlertTriangle} color="review" label="Review" value={counts.REVIEW} />
            <SummaryCard icon={XCircle} color="fail" label="Failed" value={counts.FAIL} />
            <SummaryCard icon={FileQuestion} color="neutral" label="Missing" value={counts.MISSING} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Documents submitted: <span className="font-medium text-slate-700">{bidder.documentsSubmitted}/{bidder.documentsRequired}</span>
            {"  ·  "}Last checked: <span className="font-medium text-slate-700">{bidder.lastChecked}</span>
          </div>
        </div>
      </div>

      {/* COMPLIANCE CHECKLIST */}
      <SectionHeading title="Compliance Checklist" />
      {!results ? <LoadingState /> : <ComplianceTable results={results} onViewEvidence={openEvidence} />}

      {/* MISMATCHES */}
      <SectionHeading title="Detected Inconsistencies" className="mt-8" />
      {mismatchList && mismatchList.length > 0 ? (
        <div className="space-y-3">
          {mismatchList.map((m) => (
            <div key={m.id} className="bg-white rounded-lg border border-review-100 shadow-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <GitCompareArrows size={16} className="text-review-600 shrink-0" />
                  <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                </div>
                <StatusBadge status={m.severity} size="sm" variant={m.severity === "HIGH" ? "fail" : m.severity === "MEDIUM" ? "review" : "neutral"} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  <p className="text-xs text-slate-500">{m.docA.label}</p>
                  <p className="font-medium text-slate-800 mt-0.5">"{m.docA.value}"</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  <p className="text-xs text-slate-500">{m.docB.label}</p>
                  <p className="font-medium text-slate-800 mt-0.5">"{m.docB.value}"</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                {m.similarity != null && (
                  <span className="text-slate-500">
                    Similarity: <span className="font-semibold text-slate-700">{m.similarity}%</span>
                  </span>
                )}
                <span className="text-review-700 font-medium ml-auto">{m.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-5 text-sm text-slate-500">
          No inconsistencies detected across submitted documents.
        </div>
      )}

      {/* AI ANALYSIS PANEL */}
      <SectionHeading title="AI Verification Summary" className="mt-8" />
      {summary && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <div className="flex items-start gap-2.5 mb-4">
            <Sparkles size={16} className="text-navy-700 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">{summary.assessment}</p>
          </div>
          <div className="space-y-2 mb-4">
            {summary.findings.map((f, i) => {
              const Icon = FINDING_ICON[f.type];
              return (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <Icon size={15} className={`${FINDING_COLOR[f.type]} shrink-0 mt-0.5`} />
                  <span className="text-slate-700">{f.text}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-info-50 border border-info-100 rounded-md px-3 py-2.5 flex items-start gap-2.5">
            <Info size={15} className="text-info-600 shrink-0 mt-0.5" />
            <p className="text-xs text-info-700">
              <span className="font-semibold">{summary.recommendation}.</span> This is a decision-support output only —
              Procurement Officer review required. The AI does not qualify or disqualify bidders automatically.
            </p>
          </div>
        </div>
      )}

      {/* RISK BREAKDOWN */}
      <SectionHeading title="Risk Breakdown" className="mt-8" />
      {risk && risk.length > 0 && <RiskChart data={risk} finalScore={bidder.complianceScore} />}

      {/* FINAL DECISION */}
      <SectionHeading title="Procurement Officer Decision" className="mt-8" />
      <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <ShieldAlert size={16} className="text-navy-700" />
          <p className="text-sm font-semibold text-slate-800">AI Recommendation</p>
        </div>
        <p className="text-sm text-slate-600 mb-4 ml-[26px]">{summary?.recommendation}</p>

        <div className="bg-review-50 border border-review-100 rounded-md px-3 py-2.5 mb-5 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-review-600 shrink-0 mt-0.5" />
          <p className="text-xs text-review-700">
            AI output is advisory. The final qualification decision must be made by the Procurement Officer.
          </p>
        </div>

        {finalDecision ? (
          <div className="flex items-center gap-2.5 bg-pass-50 border border-pass-100 rounded-md px-4 py-3">
            <CheckCircle2 size={18} className="text-pass-600" />
            <p className="text-sm font-medium text-pass-700">
              Decision recorded: <span className="font-bold">{finalDecision}</span>. This action has been logged to the
              Audit Trail.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button variant="success" onClick={() => setDecisionModal("Approve")}>
              Approve / Qualify
            </Button>
            <Button variant="danger" onClick={() => setDecisionModal("Reject")}>
              Reject / Disqualify
            </Button>
            <Button variant="warning" onClick={() => setDecisionModal("Review")}>
              Send for Review
            </Button>
          </div>
        )}
      </div>

      <EvidencePanel
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        result={activeResult}
        requirementMeta={activeResult ? requirementMetaFor(activeResult.key) : null}
      />

      <Modal
        open={!!decisionModal}
        onClose={() => {
          setDecisionModal(null);
          setConfirmed(false);
        }}
        title="Confirm Procurement Decision"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDecisionModal(null);
                setConfirmed(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={decisionModal === "Reject" ? "danger" : decisionModal === "Review" ? "warning" : "success"}
              size="sm"
              disabled={!confirmed}
              onClick={handleDecisionConfirm}
            >
              Confirm {decisionModal}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            You are about to record <span className="font-semibold">{decisionModal}</span> for{" "}
            <span className="font-semibold">{bidder.name}</span> on tender {bidder.tenderId}.
          </p>
          <div className="bg-review-50 border border-review-100 rounded-md px-3 py-2.5 flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-review-600 shrink-0 mt-0.5" />
            <p className="text-xs text-review-700">
              AI output is advisory only. By confirming, you acknowledge this is a manual decision made by the
              Procurement Officer based on the evidence reviewed.
            </p>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-navy-800 focus-ring"
            />
            I have reviewed the evidence and confirm this decision.
          </label>
        </div>
      </Modal>
    </AppLayout>
  );
}

function SummaryCard({ icon: Icon, color, label, value }) {
  const styles = {
    pass: "bg-pass-50 text-pass-700",
    review: "bg-review-50 text-review-700",
    fail: "bg-fail-50 text-fail-700",
    neutral: "bg-slate-100 text-slate-600",
  };
  return (
    <div className={`rounded-md p-3 ${styles[color]}`}>
      <Icon size={16} className="mb-1.5" />
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="text-[11px] font-medium mt-1 opacity-90">{label}</p>
    </div>
  );
}

function SectionHeading({ title, className = "" }) {
  return <h3 className={`text-sm font-semibold text-slate-800 mb-3 ${className}`}>{title}</h3>;
}
