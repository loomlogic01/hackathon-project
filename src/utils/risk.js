// Centralized, easy-to-edit risk thresholds.
// Change these numbers to retune HIGH / MEDIUM / LOW risk banding across the whole app.
export const RISK_BANDS = [
  { label: "HIGH", min: 0, max: 40, badge: "fail" },
  { label: "MEDIUM", min: 41, max: 70, badge: "review" },
  { label: "LOW", min: 71, max: 100, badge: "pass" },
];

export function riskForScore(score) {
  return RISK_BANDS.find((b) => score >= b.min && score <= b.max) || RISK_BANDS[0];
}
