import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

export default function RiskChart({ data, finalScore }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Compliance Score Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Contribution of each factor to the final score</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Final Score</p>
          <p className="text-lg font-bold text-slate-900">{finalScore} / 100</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis
            type="category"
            dataKey="factor"
            width={130}
            tick={{ fontSize: 12, fill: "#334155" }}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <ReferenceLine x={0} stroke="#94a3b8" />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }}
            formatter={(value) => [`${value > 0 ? "+" : ""}${value} pts`, "Impact"]}
          />
          <Bar dataKey="impact" radius={[3, 3, 3, 3]} barSize={16}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.impact >= 0 ? "#1f9d55" : "#dc2626"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
