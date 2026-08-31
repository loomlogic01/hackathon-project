import React, { useState } from "react";
import { Building2, User, ShieldCheck, SlidersHorizontal, Bell } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { Input, Checkbox } from "../components/Input";
import Button from "../components/Button";

const SECTIONS = [
  { key: "org", label: "Organization", icon: Building2 },
  { key: "profile", label: "User Profile", icon: User },
  { key: "rules", label: "Compliance Rules", icon: ShieldCheck },
  { key: "risk", label: "Risk Thresholds", icon: SlidersHorizontal },
  { key: "notifications", label: "Notification Settings", icon: Bell },
];

export default function Settings() {
  const [active, setActive] = useState("org");

  return (
    <AppLayout title="Settings" subtitle="Platform configuration for your organization">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-1">
          <nav className="bg-white rounded-lg border border-slate-200 shadow-card p-2 space-y-0.5">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-left transition-colors
                  ${active === key ? "bg-navy-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-3 bg-white rounded-lg border border-slate-200 shadow-card p-6">
          {active === "org" && (
            <SettingsSection title="Organization">
              <Input id="orgName" label="Organization Name" defaultValue="Chennai Petroleum Corporation Limited (CPCL)" />
              <Input id="orgDept" label="Department" defaultValue="Ministry of Petroleum & Natural Gas" />
              <Input id="orgGem" label="GeM Organization Code" defaultValue="GEM-ORG-CPCL-001" />
            </SettingsSection>
          )}

          {active === "profile" && (
            <SettingsSection title="User Profile">
              <Input id="userName" label="Full Name" defaultValue="Procurement Officer" />
              <Input id="userEmail" label="Email" defaultValue="officer@cpcl.gov.in" type="email" />
              <Input id="userRole" label="Role" defaultValue="Procurement Officer" disabled />
            </SettingsSection>
          )}

          {active === "rules" && (
            <SettingsSection title="Compliance Rules">
              <p className="text-xs text-slate-500 mb-2 -mt-2">
                Default document requirements applied to newly created tenders.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {["GST", "PAN", "Udyam/MSME", "Income Tax", "OEM Authorization", "Make in India", "EPFO/ESIC", "Startup India"].map(
                  (r) => (
                    <Checkbox key={r} id={r} label={r} checked={["GST", "PAN", "Udyam/MSME"].includes(r)} onChange={() => {}} />
                  )
                )}
              </div>
            </SettingsSection>
          )}

          {active === "risk" && (
            <SettingsSection title="Risk Thresholds">
              <div className="grid grid-cols-3 gap-3">
                <Input id="lowMin" label="LOW Risk (min score)" defaultValue="71" />
                <Input id="medMin" label="MEDIUM Risk (min score)" defaultValue="41" />
                <Input id="highMax" label="HIGH Risk (max score)" defaultValue="40" />
              </div>
              <p className="text-xs text-slate-500">
                Adjusting these values updates risk banding across the Dashboard, Bidder Evaluation, and Risk Analysis
                pages.
              </p>
            </SettingsSection>
          )}

          {active === "notifications" && (
            <SettingsSection title="Notification Settings">
              <Checkbox id="n1" label="Notify on new bidder document upload" checked onChange={() => {}} />
              <Checkbox id="n2" label="Notify when a mismatch is detected" checked onChange={() => {}} />
              <Checkbox id="n3" label="Notify when a compliance score drops below threshold" checked onChange={() => {}} />
              <Checkbox id="n4" label="Weekly compliance summary email" onChange={() => {}} />
            </SettingsSection>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}
