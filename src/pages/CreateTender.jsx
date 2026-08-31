import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { Input, Select, Checkbox } from "../components/Input";
import Button from "../components/Button";
import FileUpload from "../components/FileUpload";
import { createTender } from "../services/api";
import { COMPLIANCE_CATALOG } from "../data/mockData";

export default function CreateTender() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id: "",
    title: "",
    organization: "",
    department: "",
    category: "",
    deadline: "",
  });
  const [selectedReqs, setSelectedReqs] = useState(["gst", "pan", "udyam"]);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleReq(key) {
    setSelectedReqs((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const requirements = COMPLIANCE_CATALOG.filter((r) => selectedReqs.includes(r.key)).map((r) => ({
      key: r.key,
      name: r.name,
      mandatory: r.type === "Mandatory",
      description: `${r.name} document required as per tender terms.`,
      source: "Tender.pdf",
      page: "—",
      clause: "—",
      clauseText: `${r.name} is required as per the tender's eligibility criteria.`,
    }));
    const created = await createTender({ ...form, requirements });
    setSubmitting(false);
    navigate(`/tenders/${created.id}`);
  }

  return (
    <AppLayout title="Create Tender" subtitle="Define tender details and required compliance documents">
      <button
        onClick={() => navigate("/tenders")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Tenders
      </button>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Tender Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="tenderId"
              label="Tender ID"
              placeholder="GEM-2026-XXX"
              value={form.id}
              onChange={(e) => update("id", e.target.value)}
            />
            <Input
              id="deadline"
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              required
            />
          </div>
          <Input
            id="title"
            label="Tender Title"
            placeholder="e.g. Supply of Industrial Equipment"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="organization"
              label="Organization"
              placeholder="e.g. Chennai Petroleum Corporation Limited"
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              required
            />
            <Input
              id="department"
              label="Department"
              placeholder="e.g. Ministry of Petroleum & Natural Gas"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              required
            />
          </div>
          <Select
            id="category"
            label="Tender Category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Select category</option>
            <option>Industrial Equipment & Machinery</option>
            <option>Safety Equipment</option>
            <option>AMC Services</option>
            <option>IT & Software</option>
            <option>Civil Works</option>
          </Select>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Select Compliance Requirements</h3>
          <p className="text-xs text-slate-500 mb-4">
            Choose the documents bidders must submit for this tender. These map directly to the AI compliance checklist.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMPLIANCE_CATALOG.map((req) => (
              <Checkbox
                key={req.key}
                id={req.key}
                label={req.name}
                checked={selectedReqs.includes(req.key)}
                onChange={() => toggleReq(req.key)}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Upload Tender Document</h3>
          <FileUpload label="" hint="Upload the tender PDF for AI clause extraction" />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate("/tenders")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Tender"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
