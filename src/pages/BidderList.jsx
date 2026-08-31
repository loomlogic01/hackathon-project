import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, ClipboardCheck } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { LoadingState, EmptyState } from "../components/EmptyState";
import { getBiddersByTender, getTenderById } from "../services/api";
import { riskForScore } from "../utils/risk";

export default function BidderList() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [bidders, setBidders] = useState(null);
  const [tender, setTender] = useState(null);

  useEffect(() => {
    getBiddersByTender(tenderId).then(setBidders);
    getTenderById(tenderId).then(setTender);
  }, [tenderId]);

  const columns = [
    { key: "name", header: "Bidder", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    {
      key: "documents",
      header: "Documents",
      render: (r) => (
        <span className={r.documentsSubmitted < r.documentsRequired ? "text-fail-600 font-medium" : "text-slate-700"}>
          {r.documentsSubmitted}/{r.documentsRequired}
        </span>
      ),
    },
    {
      key: "complianceScore",
      header: "Compliance Score",
      render: (r) => <span className="font-semibold text-slate-800">{r.complianceScore}%</span>,
    },
    {
      key: "risk",
      header: "Risk",
      render: (r) => {
        const risk = riskForScore(r.complianceScore);
        return <StatusBadge status={risk.label} size="sm" />;
      },
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} size="sm" /> },
    { key: "lastChecked", header: "Last Checked", render: (r) => <span className="text-xs text-slate-500">{r.lastChecked}</span> },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/bidders/${r.id}`)}>
            View
          </Button>
          <Button variant="secondary" size="sm" icon={ClipboardCheck} onClick={() => navigate(`/bidders/${r.id}`)}>
            Evaluate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout
      title={tender ? `Bidders — ${tender.id}` : "Bidders"}
      subtitle={tender ? tender.title : "Bidder compliance overview"}
    >
      <button
        onClick={() => navigate(`/tenders/${tenderId}`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Tender
      </button>

      {!bidders ? (
        <LoadingState label="Loading bidders…" />
      ) : bidders.length === 0 ? (
        <EmptyState title="No bidders yet" description="No bidders have submitted proposals for this tender." />
      ) : (
        <DataTable columns={columns} rows={bidders} />
      )}
    </AppLayout>
  );
}
