import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { LoadingState } from "../components/EmptyState";
import { getAllBidders } from "../services/api";
import { COMPLIANCE_CATALOG } from "../data/mockData";
import { riskForScore } from "../utils/risk";

export default function ComplianceOverview() {
  const navigate = useNavigate();
  const [bidders, setBidders] = useState(null);

  useEffect(() => {
    getAllBidders().then(setBidders);
  }, []);

  const columns = [
    { key: "name", header: "Bidder", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: "tenderId", header: "Tender" },
    { key: "complianceScore", header: "Score", render: (r) => <span className="font-semibold">{r.complianceScore}%</span> },
    { key: "risk", header: "Risk", render: (r) => <StatusBadge status={riskForScore(r.complianceScore).label} size="sm" /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} size="sm" /> },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/bidders/${r.id}`)}>
          View Checklist
        </Button>
      ),
    },
  ];

  return (
    <AppLayout title="Compliance" subtitle="Standard compliance requirement catalog and bidder-level results">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Standard Requirement Catalog</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {COMPLIANCE_CATALOG.map((r) => (
          <div key={r.key} className="bg-white rounded-lg border border-slate-200 shadow-card p-3.5">
            <p className="text-sm font-semibold text-slate-800">{r.name}</p>
            <span
              className={`inline-block mt-2 text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                r.type === "Mandatory"
                  ? "bg-navy-50 text-navy-700"
                  : r.type === "Conditional"
                  ? "bg-review-50 text-review-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {r.type}
            </span>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-slate-800 mb-3">Bidder Compliance Results</h3>
      {!bidders ? <LoadingState label="Loading compliance results…" /> : <DataTable columns={columns} rows={bidders} />}
    </AppLayout>
  );
}
