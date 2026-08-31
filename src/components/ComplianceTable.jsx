import React from "react";
import { Eye, FileWarning } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";

export default function ComplianceTable({ results, onViewEvidence }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-card">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Requirement</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Confidence</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Evidence</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((r) => (
            <tr key={r.key} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{r.requirement}</td>
              <td className="px-4 py-3.5">
                <StatusBadge status={r.status} size="sm" />
              </td>
              <td className="px-4 py-3.5 text-sm text-slate-600">
                {r.confidence > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          r.confidence >= 90 ? "bg-pass-500" : r.confidence >= 75 ? "bg-review-500" : "bg-fail-500"
                        }`}
                        style={{ width: `${r.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{r.confidence}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-sm text-slate-600">
                {r.documentName ? (
                  r.documentName
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-fail-600 font-medium">
                    <FileWarning size={13} /> Not Found
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <Button variant="ghost" size="sm" icon={Eye} onClick={() => onViewEvidence(r)}>
                  {r.status === "FAIL" || r.status === "MISSING" ? "View Issue" : "View Evidence"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
