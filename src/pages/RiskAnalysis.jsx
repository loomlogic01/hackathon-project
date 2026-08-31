import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import AppLayout from "../layouts/AppLayout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { LoadingState } from "../components/EmptyState";
import { getAllBidders } from "../services/api";
import { riskForScore, RISK_BANDS } from "../utils/risk";

const PIE_COLORS = { LOW: "#1f9d55", MEDIUM: "#d97706", HIGH: "#dc2626" };

export default function RiskAnalysis() {
  const navigate = useNavigate();
  const [bidders, setBidders] = useState(null);

  useEffect(() => {
    getAllBidders().then(setBidders);
  }, []);

  const distribution = React.useMemo(() => {
    if (!bidders) return [];
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    bidders.forEach((b) => {
      counts[riskForScore(b.complianceScore).label] += 1;
    });
    return RISK_BANDS.map((b) => ({ name: b.label, value: counts[b.label] }));
  }, [bidders]);

  const highRisk = bidders?.filter((b) => riskForScore(b.complianceScore).label === "HIGH") || [];

  const columns = [
    { key: "name", header: "Bidder", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: "tenderId", header: "Tender" },
    { key: "complianceScore", header: "Score", render: (r) => <span className="font-semibold">{r.complianceScore}%</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} size="sm" /> },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/bidders/${r.id}`)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <AppLayout title="Risk Analysis" subtitle="Portfolio-wide risk distribution across all bidders">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Risk Distribution</h3>
          {!bidders ? (
            <LoadingState />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Risk Banding Thresholds</h3>
          <p className="text-xs text-slate-500 mb-4">
            Thresholds are configurable in code (<code className="bg-slate-100 px-1 rounded">src/utils/risk.js</code>) and
            apply consistently across the platform.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {RISK_BANDS.map((b) => (
              <div key={b.label} className={`rounded-md p-4 border ${
                b.badge === "pass" ? "bg-pass-50 border-pass-100" : b.badge === "review" ? "bg-review-50 border-review-100" : "bg-fail-50 border-fail-100"
              }`}>
                <StatusBadge status={b.label} size="sm" />
                <p className="text-lg font-bold text-slate-800 mt-2">
                  {b.min}–{b.max}
                </p>
                <p className="text-xs text-slate-500">compliance score range</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-fail-600" />
        <h3 className="text-sm font-semibold text-slate-800">High Risk Bidders — Requires Attention</h3>
      </div>
      {!bidders ? <LoadingState /> : <DataTable columns={columns} rows={highRisk} emptyMessage="No high risk bidders currently." />}
    </AppLayout>
  );
}
