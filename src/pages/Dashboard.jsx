import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileStack, Users, ShieldCheck, AlertTriangle, Plus } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import KpiCard from "../components/KpiCard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { LoadingState } from "../components/EmptyState";
import { getDashboardKpis, getRecentTenders } from "../services/api";
import { formatDate } from "../utils/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [recentTenders, setRecentTenders] = useState(null);

  useEffect(() => {
    getDashboardKpis().then(setKpis);
    getRecentTenders(5).then(setRecentTenders);
  }, []);

  const columns = [
    { key: "id", header: "Tender ID", render: (r) => <span className="font-semibold text-navy-800">{r.id}</span> },
    { key: "title", header: "Tender Name", render: (r) => <span className="text-slate-700">{r.title}</span> },
    { key: "department", header: "Department" },
    { key: "bidderCount", header: "Bidders", render: (r) => <span className="font-medium">{r.bidderCount}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} size="sm" /> },
    { key: "deadline", header: "Deadline", render: (r) => formatDate(r.deadline) },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/tenders/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <AppLayout title="Procurement Overview" subtitle="Real-time snapshot of tenders, bidders, and compliance health">
      {!kpis ? (
        <LoadingState label="Loading dashboard…" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Active Tenders" value={kpis.activeTenders} icon={FileStack} accent="info" trend="+2 this month" />
            <KpiCard label="Bidders Under Review" value={kpis.biddersUnderReview} icon={Users} accent="navy" trend="Across all active tenders" />
            <KpiCard label="Average Compliance" value={kpis.averageCompliance} suffix="%" icon={ShieldCheck} accent="pass" trend="Stable vs last week" />
            <KpiCard label="High Risk Bidders" value={kpis.highRiskBidders} icon={AlertTriangle} accent="fail" trend="Requires manual review" />
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Recent Tenders</h2>
            <Button icon={Plus} size="sm" onClick={() => navigate("/tenders/create")}>
              Create Tender
            </Button>
          </div>

          <DataTable columns={columns} rows={recentTenders || []} />
        </>
      )}
    </AppLayout>
  );
}
