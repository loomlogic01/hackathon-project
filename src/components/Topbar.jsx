import React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-3.5 gap-4">
        <div className="min-w-0">
          {title && <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative hidden md:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenders, bidders, documents…"
              className="w-72 rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm
                focus-ring focus-visible:border-navy-700 focus-visible:bg-white transition-colors"
            />
          </div>
          <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-ring" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-fail-500" />
          </button>
          <button className="flex items-center gap-2 rounded-md pl-1 pr-2 py-1 hover:bg-slate-100 focus-ring">
            <div className="h-8 w-8 rounded-full bg-navy-800 flex items-center justify-center text-white text-xs font-bold">
              PO
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
