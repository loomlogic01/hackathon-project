export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function statusToVariant(status) {
  const map = {
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
  };
  return map[status] || "neutral";
}
