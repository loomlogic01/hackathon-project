import React from "react";
import { FileText, ShieldAlert, BookOpen, Info } from "lucide-react";
import { SidePanel } from "./Modal";
import StatusBadge from "./StatusBadge";
import Button from "./Button";

export default function EvidencePanel({ open, onClose, result, requirementMeta }) {
  if (!result) return null;

  const isNegative = result.status === "FAIL" || result.status === "MISSING";

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={`${result.requirement} — Verification Result`}
      subtitle="AI-generated evidence for Procurement Officer review"
      footer={
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info size={13} /> This result is advisory. It does not qualify or disqualify the bidder.
          </p>
          <Button variant="secondary" size="sm" icon={FileText}>
            View Source Document
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <StatusBadge status={result.status} />
          {result.confidence > 0 && (
            <span className="text-xs text-slate-500">AI Confidence: <span className="font-semibold text-slate-700">{result.confidence}%</span></span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Reason</p>
          <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5">
            {result.reason}
          </p>
        </div>

        {requirementMeta && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <BookOpen size={13} /> Tender Clause Evidence
            </p>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 text-sm">
              <div className="px-3 py-2 flex justify-between">
                <span className="text-slate-500">Source</span>
                <span className="font-medium text-slate-800">{requirementMeta.source}</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span className="text-slate-500">Page</span>
                <span className="font-medium text-slate-800">{requirementMeta.page}</span>
              </div>
              <div className="px-3 py-2 flex justify-between">
                <span className="text-slate-500">Clause</span>
                <span className="font-medium text-slate-800">{requirementMeta.clause}</span>
              </div>
              <div className="px-3 py-2">
                <span className="text-slate-500 block mb-1">Requirement Text</span>
                <span className="text-slate-700 italic">"{requirementMeta.clauseText}"</span>
              </div>
            </div>
          </div>
        )}

        {result.extracted && Object.keys(result.extracted).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Extracted Data</p>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 text-sm">
              {Object.entries(result.extracted).map(([k, v]) => (
                <div key={k} className="px-3 py-2 flex justify-between gap-4">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-800 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5">
            <p className="text-xs text-slate-500 mb-0.5">Bidder documents searched</p>
            <p className="font-semibold text-slate-800">8</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5">
            <p className="text-xs text-slate-500 mb-0.5">Matching document</p>
            <p className="font-semibold text-slate-800">{result.documentName || "None"}</p>
          </div>
        </div>

        {isNegative && (
          <div className="bg-fail-50 border border-fail-100 rounded-md px-3 py-3 flex gap-2.5">
            <ShieldAlert size={16} className="text-fail-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-fail-700">Why this matters</p>
              <p className="text-xs text-fail-700/90 mt-0.5">
                Procurement Officer review required. This finding does not automatically disqualify the bidder.
              </p>
            </div>
          </div>
        )}
      </div>
    </SidePanel>
  );
}
