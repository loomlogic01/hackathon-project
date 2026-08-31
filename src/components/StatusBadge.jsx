import React from "react";
import { Check, AlertTriangle, X, HelpCircle, Info } from "lucide-react";

const STYLES = {
  pass: "bg-pass-50 text-pass-700 border-pass-100",
  review: "bg-review-50 text-review-700 border-review-100",
  fail: "bg-fail-50 text-fail-700 border-fail-100",
  info: "bg-info-50 text-info-600 border-info-100",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

const ICONS = {
  pass: Check,
  review: AlertTriangle,
  fail: X,
  info: Info,
  neutral: HelpCircle,
};

const LABEL_VARIANT_MAP = {
  PASS: "pass",
  REVIEW: "review",
  FAIL: "fail",
  MISSING: "fail",
  Active: "info",
  "Under Evaluation": "review",
  Completed: "pass",
  Compliant: "pass",
  "Under Review": "review",
  "Needs Attention": "fail",
  LOW: "pass",
  MEDIUM: "review",
  HIGH: "fail",
};

export default function StatusBadge({ status, variant, showIcon = true, size = "md" }) {
  const resolvedVariant = variant || LABEL_VARIANT_MAP[status] || "neutral";
  const Icon = ICONS[resolvedVariant];
  const sizeClasses = size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wide
        ${sizeClasses} ${STYLES[resolvedVariant]}`}
    >
      {showIcon && Icon && <Icon size={size === "sm" ? 11 : 12} strokeWidth={2.5} />}
      {status}
    </span>
  );
}
