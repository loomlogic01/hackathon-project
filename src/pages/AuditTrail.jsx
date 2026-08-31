import React, { useEffect, useState } from "react";
import { History } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { LoadingState } from "../components/EmptyState";
import { getAuditTrail } from "../services/api";

export default function AuditTrail() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    getAuditTrail().then(setEntries);
  }, []);

  const columns = [
    { key: "timestamp", header: "Timestamp", render: (r) => <span className="text-xs text-slate-500 whitespace-nowrap">{r.timestamp}</span> },
    {
      key: "user",
      header: "User",
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            r.user === "AI Engine" ? "bg-info-50 text-info-600" : "bg-navy-50 text-navy-700"
          }`}
        >
          {r.user}
        </span>
      ),
    },
    { key: "action", header: "Action", render: (r) => <span className="font-medium text-slate-800">{r.action}</span> },
    { key: "entity", header: "Entity" },
    {
      key: "result",
      header: "Result",
      render: (r) =>
        ["Success", "Verified", "Approved"].includes(r.result) ? (
          <StatusBadge status="PASS" size="sm" />
        ) : r.result.toLowerCase().includes("review") ? (
          <StatusBadge status="REVIEW" size="sm" />
        ) : (
          <span className="text-xs text-slate-600">{r.result}</span>
        ),
    },
  ];

  return (
    <AppLayout title="Audit Trail" subtitle="Immutable log of all system and officer actions for auditability">
      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
        <History size={14} /> Showing {entries?.length || 0} recent events across all tenders and bidders
      </div>
      {!entries ? <LoadingState label="Loading audit trail…" /> : <DataTable columns={columns} rows={entries} />}
    </AppLayout>
  );
}
