import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { LoadingState, EmptyState } from "../components/EmptyState";
import { getDocumentExtraction, getDocuments } from "../services/api";

export default function DocumentViewer() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(undefined);
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    getDocumentExtraction(documentId).then(setDetail);
    getDocuments().then((docs) => setDoc(docs.find((d) => d.id === documentId) || null));
  }, [documentId]);

  if (detail === undefined) {
    return (
      <AppLayout title="Document Viewer">
        <LoadingState label="Loading document…" />
      </AppLayout>
    );
  }

  const fallbackFields = doc
    ? [
        { label: "Document Type", value: doc.type, confidence: 100 },
        { label: "Associated Bidder", value: doc.bidder, confidence: 100 },
        { label: "Extraction Status", value: doc.extraction, confidence: 100 },
      ]
    : [];

  const fields = detail?.fields || fallbackFields;

  return (
    <AppLayout title={doc?.name || "Document"} subtitle="AI-extracted information from the uploaded document">
      <button
        onClick={() => navigate("/documents")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Document Center
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-slate-200 shadow-card flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="bg-slate-100 rounded-full p-4 mb-4">
            <FileText size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">{doc?.name || "Document"}</p>
          <p className="text-xs text-slate-400 mt-1">Document preview placeholder</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">AI Extracted Information</h3>
          {fields.length === 0 ? (
            <EmptyState title="No extraction data available" />
          ) : (
            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={i} className="border border-slate-200 rounded-md px-3.5 py-3">
                  <p className="text-xs text-slate-500">{f.label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{f.value}</p>
                  {f.confidence != null && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            f.confidence >= 90 ? "bg-pass-500" : f.confidence >= 75 ? "bg-review-500" : "bg-fail-500"
                          }`}
                          style={{ width: `${f.confidence}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">{f.confidence}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
