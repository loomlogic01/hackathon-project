import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, Upload, CheckCircle2, CircleDot } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import FileUpload from "../components/FileUpload";
import { LoadingState, EmptyState } from "../components/EmptyState";
import { getTenderById } from "../services/api";
import { formatDate } from "../utils/format";

export default function TenderDetails() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(undefined);

  useEffect(() => {
    getTenderById(tenderId).then(setTender);
  }, [tenderId]);

  if (tender === undefined) {
    return (
      <AppLayout title="Tender Details">
        <LoadingState label="Loading tender…" />
      </AppLayout>
    );
  }

  if (!tender) {
    return (
      <AppLayout title="Tender Details">
        <EmptyState title="Tender not found" description="This tender does not exist in the system." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={tender.id} subtitle={tender.title}>
      <button
        onClick={() => navigate("/tenders")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Tenders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tender</p>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{tender.id}</h2>
              <p className="text-sm text-slate-600 mt-1">{tender.title}</p>
            </div>
            <StatusBadge status={tender.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs text-slate-500">Organization</p>
              <p className="font-medium text-slate-800 mt-0.5">{tender.organization}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Category</p>
              <p className="font-medium text-slate-800 mt-0.5">{tender.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Deadline</p>
              <p className="font-medium text-slate-800 mt-0.5">{formatDate(tender.deadline)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Bidders</p>
              <p className="font-medium text-slate-800 mt-0.5">{tender.bidderCount}</p>
            </div>
          </div>
          <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-100">
            <Button icon={ClipboardCheck} onClick={() => navigate(`/tenders/${tender.id}/bidders`)}>
              Evaluate Bidders
            </Button>
            <Button variant="secondary" icon={Upload}>
              Upload Tender Documents
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <p className="text-sm font-semibold text-slate-800 mb-3">Upload Tender Document</p>
          <FileUpload label="" hint="PDF format, max 20MB" />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-800 mb-3">Compliance Requirements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tender.requirements.map((req) => (
          <div key={req.key} className="bg-white rounded-lg border border-slate-200 shadow-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {req.mandatory ? (
                  <CheckCircle2 size={15} className="text-navy-700 shrink-0" />
                ) : (
                  <CircleDot size={15} className="text-slate-400 shrink-0" />
                )}
                <p className="text-sm font-semibold text-slate-800">{req.name}</p>
              </div>
              <span
                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  req.mandatory ? "bg-navy-50 text-navy-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {req.mandatory ? "Required" : "Conditional"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">{req.description}</p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Source:</span> {req.source} — Page {req.page} — Clause{" "}
              {req.clause}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
