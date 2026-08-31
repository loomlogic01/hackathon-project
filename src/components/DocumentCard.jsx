import React from "react";
import { FileText, Eye, ScanText } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";

export default function DocumentCard({ doc, onView }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-card p-4 flex items-start gap-3">
      <div className="rounded-md bg-info-50 text-info-600 p-2.5 shrink-0">
        <FileText size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{doc.type}</p>
        <p className="text-xs text-slate-400 mt-1">{doc.bidder}</p>
        <div className="flex items-center gap-2 mt-2.5">
          <StatusBadge status={doc.verification} size="sm" />
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ScanText size={11} /> {doc.extraction}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="sm" icon={Eye} onClick={() => onView?.(doc)}>
        View
      </Button>
    </div>
  );
}
