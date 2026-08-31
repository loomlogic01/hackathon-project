import React from "react";

const ACCENTS = {
  info: "text-info-600 bg-info-50",
  pass: "text-pass-600 bg-pass-50",
  review: "text-review-600 bg-review-50",
  fail: "text-fail-600 bg-fail-50",
  navy: "text-navy-700 bg-slate-100",
};

export default function KpiCard({ label, value, suffix = "", icon: Icon, accent = "navy", trend }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {value}
          {suffix && <span className="text-base font-semibold text-slate-500">{suffix}</span>}
        </p>
        {trend && <p className="mt-1.5 text-xs text-slate-500">{trend}</p>}
      </div>
      {Icon && (
        <div className={`rounded-md p-2.5 ${ACCENTS[accent]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
