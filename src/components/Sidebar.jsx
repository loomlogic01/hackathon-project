import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileStack,
  Users,
  FolderOpen,
  ShieldCheck,
  AlertTriangle,
  History,
  Settings,
  ShieldHalf,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tenders", label: "Tenders", icon: FileStack },
  { to: "/bidders", label: "Bidders", icon: Users },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/compliance", label: "Compliance", icon: ShieldCheck },
  { to: "/risk-analysis", label: "Risk Analysis", icon: AlertTriangle },
  { to: "/audit-trail", label: "Audit Trail", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-navy-950 text-slate-200 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="bg-white/10 rounded-md p-1.5">
          <ShieldHalf size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">BidSure AI</p>
          <p className="text-[10px] text-slate-400 mt-1">Compliance Verification</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
              ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          PO
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">Procurement Officer</p>
          <p className="text-xs text-slate-400 truncate">Demo Organization</p>
        </div>
      </div>
    </aside>
  );
}
