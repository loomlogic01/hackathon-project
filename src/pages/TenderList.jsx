import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Upload, ClipboardCheck, Eye } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { Select } from "../components/Input";
import { LoadingState } from "../components/EmptyState";
import { getTenders } from "../services/api";
import { formatDate } from "../utils/format";

export default function TenderList() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    getTenders().then(setTenders);
  }, []);

  const filtered = useMemo(() => {
    if (!tenders) return [];
    return tenders.filter((t) => {
      const matchesQuery =
        t.id.toLowerCase().includes(query.toLowerCase()) || t.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [tenders, query, statusFilter]);

  const columns = [
    { key: "id", header: "Tender ID", render: (r) => <span className="font-semibold text-navy-800">{r.id}</span> },
    { key: "title", header: "Tender Title" },
    { key: "organization", header: "Organization" },
    { key: "createdDate", header: "Created Date", render: (r) => formatDate(r.createdDate) },
    { key: "deadline", header: "Deadline", render: (r) => formatDate(r.deadline) },
    { key: "bidderCount", header: "Bidders", render: (r) => <span className="font-medium">{r.bidderCount}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} size="sm" /> },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/tenders/${r.id}`)}>
            View
          </Button>
          <Button variant="ghost" size="sm" icon={ClipboardCheck} onClick={() => navigate(`/tenders/${r.id}/bidders`)}>
            Evaluate
          </Button>
          <Button variant="ghost" size="sm" icon={Upload} onClick={() => navigate(`/tenders/${r.id}`)}>
            Upload
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Tenders" subtitle="Manage and monitor all GeM tenders in the compliance pipeline">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tender ID or title…"
            className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus-ring focus-visible:border-navy-700"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-52">
          <option>All</option>
          <option>Active</option>
          <option>Under Evaluation</option>
          <option>Completed</option>
        </Select>
        <Button icon={Plus} className="sm:ml-auto" onClick={() => navigate("/tenders/create")}>
          Create Tender
        </Button>
      </div>

      {!tenders ? <LoadingState label="Loading tenders…" /> : <DataTable columns={columns} rows={filtered} />}
    </AppLayout>
  );
}
