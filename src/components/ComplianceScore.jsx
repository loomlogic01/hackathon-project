import React from "react";
import { riskForScore } from "../utils/risk";

const RING_COLORS = {
  pass: "#16803f",
  review: "#b45309",
  fail: "#b91c1c",
};

export default function ComplianceScore({ score, size = 156, strokeWidth = 12 }) {
  const risk = riskForScore(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = RING_COLORS[risk.badge];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{score}</span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
      </div>
      <span
        className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        {risk.label} RISK
      </span>
    </div>
  );
}
