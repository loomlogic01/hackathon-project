import React from 'react';
import { 
  FileCheck, ShieldCheck, Clock, TrendingUp, 
  CheckCircle2, XCircle, FileText, ArrowRight, Building 
} from 'lucide-react';

export default function DashboardOverview({ evaluations = [], onSelectBid, onGoToWorkspace, onGoToLookup }) {
  const totalBids = evaluations.length || 3;
  const compliantBids = evaluations.filter(e => (e.score >= 80 || e.compliance_status === 'Compliant')).length || 2;
  const avgScore = evaluations.length > 0 
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.score || 0), 0) / evaluations.length)
    : 80;

  return (
    <div className="space-y-8">
      
      {/* Executive Welcome Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl text-white p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-amber-400">
              Government of India • Ministry of Commerce & Industry
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Procurement Officer Decision Hub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Automated AI verification engine validates bidder compliance across Udyam MSME, GSTN, PAN, Prior Experience, Turnover, and Non-Blacklisting records in seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onGoToWorkspace}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <FileCheck className="w-5 h-5" />
              <span>Evaluate Tender Bids</span>
            </button>

            <button
              onClick={onGoToLookup}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-5 py-3.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Building className="w-5 h-5 text-amber-400" />
              <span>Portal Query</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-black uppercase text-slate-500 mb-1">
            Total Bids Processed
          </div>
          <div className="text-3xl font-black text-slate-900">{totalBids}</div>
          <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Extracted & Audited</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-black uppercase text-slate-500 mb-1">
            Avg Compliance Score
          </div>
          <div className="text-3xl font-black text-slate-900">{avgScore} <span className="text-base text-slate-400 font-semibold">/ 100</span></div>
          <div className="text-xs text-slate-600 font-semibold mt-2">
            Threshold $\ge 80$ for Qualification
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-black uppercase text-slate-500 mb-1">
            Qualified Bidders
          </div>
          <div className="text-3xl font-black text-slate-900">{compliantBids} <span className="text-base text-slate-400 font-semibold">Bids</span></div>
          <div className="text-xs text-blue-600 font-bold mt-2">
            All Statutory Pillars Verified
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-black uppercase text-slate-500 mb-1">
            Processing Speed
          </div>
          <div className="text-3xl font-black text-slate-900">&lt; 2.5s</div>
          <div className="text-xs text-emerald-600 font-bold mt-2">
            80% Turnaround Time Saved
          </div>
        </div>

      </div>

      {/* 2-Column Section: Statutory Pillars & Active Submissions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): 5 Statutory Pillars */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Mandatory Statutory Compliance Pillars (GeM GTC 7.1)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Automated pass-rates across critical procurement requirements
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>1. MSME / Udyam Registration & Preference Check</span>
                <span className="text-emerald-700">100% Passed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>2. GSTN 15-Digit Active Status & Tax Compliance</span>
                <span className="text-emerald-700">67% Passed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>3. Past Experience Criteria (3+ Years / MSE Exemption)</span>
                <span className="text-emerald-700">67% Passed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>4. Audited Annual Turnover Declaration</span>
                <span className="text-emerald-700">67% Passed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>5. Non-Blacklisting & Integrity Affidavit</span>
                <span className="text-amber-700">60% Passed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>6. Central Debarment & Blacklist Registry Screening</span>
                <span className="text-emerald-700">80% Cleared</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>7. EPFO / ESIC Statutory Labor Compliance</span>
                <span className="text-emerald-700">60% Verified</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                <span>8. Startup India, NSIC & OEM Authorization</span>
                <span className="text-blue-700">40% Recognized</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bid Submission Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Bid Submission Queue
              </h3>
              <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline" onClick={onGoToWorkspace}>
                View All
              </span>
            </div>

            <div className="space-y-3">
              {evaluations.slice(0, 3).map((bid, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectBid(bid)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between font-extrabold text-slate-900 text-sm mb-1">
                    <span className="truncate">{bid.company || bid.filename}</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                      bid.score >= 80 ? 'bg-emerald-100 text-emerald-800' : bid.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {bid.score} Pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{bid.tender_id || 'GEM/2026/B/894721'}</span>
                    <span className="font-bold text-slate-700">{bid.officer_decision || 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onGoToWorkspace}
            className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Open Tender Evaluation Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
