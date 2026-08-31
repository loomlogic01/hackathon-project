import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Eye, ScanText } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import FileUpload from "../components/FileUpload";
import { LoadingState } from "../components/EmptyState";
import { getDocuments } from "../services/api";
import { formatDate } from "../utils/format";

export default function DocumentCenter() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    getDocuments().then(setDocuments);
  }, []);

  const columns = [
    { key: "name", header: "Document", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: "type", header: "Type" },
    { key: "bidder", header: "Bidder" },
    { key: "uploaded", header: "Uploaded", render: (r) => formatDate(r.uploaded) },
    {
      key: "extraction",
      header: "AI Extraction",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
          <ScanText size={12} /> {r.extraction}
        </span>
      ),
    },
    { key: "verification", header: "Verification", render: (r) => <StatusBadge status={r.verification} size="sm" /> },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/documents/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <AppLayout title="Document Center" subtitle="All bidder and tender documents with AI extraction status">
      <div className="flex justify-end mb-4">
        <Button icon={Upload} onClick={() => setUploadOpen(true)}>
          Upload Document
        </Button>
      </div>

      {!documents ? <LoadingState label="Loading documents…" /> : <DataTable columns={columns} rows={documents} />}

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(false)}>
              Upload
            </Button>
          </div>
        }
      >
        <FileUpload label="Select document" hint="PDF, JPG or PNG — max 20MB" />
      </Modal>
    </AppLayout>
  );
}
