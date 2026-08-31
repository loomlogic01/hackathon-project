import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { LoadingState } from "../components/EmptyState";
import { getAllBidders } from "../services/api";
import { riskForScore } from "../utils/risk";

export default function AllBidders() {
  const navigate = useNavigate();
  const [bidders, setBidders] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAllBidders().then(setBidders);
  }, []);

  const filtered = useMemo(() => {
    if (!bidders) return [];
    return bidders.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
  }, [bidders, query]);

  const columns = [
    { key: "name", header: "Bidder", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: "tenderId", header: "Tender", render: (r) => <span className="text-navy-700 font-medium">{r.tenderId}</span> },
    {
      key: "documents",
      header: "Documents",
      render: (r) => `${r.documentsSubmitted}/${r.documentsRequired}`,
    },
    { key: "complianceScore", header: "Score", render: (r) => <span className="font-semibold">{r.complianceScore}%</span> },
    {
      key: "risk",
      header: "Risk",
      render: (r) => <StatusBadge status={riskForScore(r.complianceScore).label} size="sm" />,
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} size="sm" /> },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/bidders/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <AppLayout title="Bidders" subtitle="All bidders across active and past tenders">
      <div className="relative max-w-md mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bidder name…"
          className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus-ring focus-visible:border-navy-700"
        />
      </div>
      {!bidders ? <LoadingState label="Loading bidders…" /> : <DataTable columns={columns} rows={filtered} />}
    </AppLayout>
  );
}
