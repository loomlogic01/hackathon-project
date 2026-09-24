import React, { useState } from 'react';
import { Search, Building, FileCheck, CreditCard, CheckCircle2, XCircle, Calculator, Sparkles, ShieldAlert, Users, AlertTriangle } from 'lucide-react';
import { verifyGstn, verifyMsme, verifyPan, checkEligibility, checkBlacklist, verifyEpfoEsic } from '../services/api';

export default function PortalLookup() {
  const [gstinInput, setGstinInput] = useState('29ABCDE1234F1Z5');
  const [gstinResult, setGstinResult] = useState(null);
  const [gstinLoading, setGstinLoading] = useState(false);

  const [udyamInput, setUdyamInput] = useState('UDYAM-KR-03-0028194');
  const [udyamResult, setUdyamResult] = useState(null);
  const [udyamLoading, setUdyamLoading] = useState(false);

  const [panInput, setPanInput] = useState('ABCDE1234F');
  const [panResult, setPanResult] = useState(null);
  const [panLoading, setPanLoading] = useState(false);

  const [blacklistInput, setBlacklistInput] = useState('ABC INFRASTRUCTURE PRIVATE LIMITED');
  const [blacklistResult, setBlacklistResult] = useState(null);
  const [blacklistLoading, setBlacklistLoading] = useState(false);

  const [epfoInput, setEpfoInput] = useState('KN/BNG/0028194/000');
  const [epfoResult, setEpfoResult] = useState(null);
  const [epfoLoading, setEpfoLoading] = useState(false);

  const [companyName, setCompanyName] = useState('Apex Technologies');
  const [experience, setExperience] = useState(2);
  const [hasMsme, setHasMsme] = useState(true);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const handleBlacklistLookup = async (e) => {
    e.preventDefault();
    if (!blacklistInput.trim()) return;
    setBlacklistLoading(true);
    try {
      const res = await checkBlacklist(blacklistInput);
      setBlacklistResult(res);
    } catch (err) {
      setBlacklistResult({ is_blacklisted: false, status: 'ERROR', message: 'Debarment lookup request failed' });
    } finally {
      setBlacklistLoading(false);
    }
  };

  const handleEpfoLookup = async (e) => {
    e.preventDefault();
    if (!epfoInput.trim()) return;
    setEpfoLoading(true);
    try {
      const res = await verifyEpfoEsic(epfoInput);
      setEpfoResult(res);
    } catch (err) {
      setEpfoResult({ valid: false, message: 'EPFO/ESIC lookup request failed' });
    } finally {
      setEpfoLoading(false);
    }
  };

  const handleGstnLookup = async (e) => {
    e.preventDefault();
    if (!gstinInput.trim()) return;
    setGstinLoading(true);
    try {
      const res = await verifyGstn(gstinInput);
      setGstinResult(res);
    } catch (err) {
      setGstinResult({ valid: false, message: 'Portal lookup request failed' });
    } finally {
      setGstinLoading(false);
    }
  };

  const handleUdyamLookup = async (e) => {
    e.preventDefault();
    if (!udyamInput.trim()) return;
    setUdyamLoading(true);
    try {
      const res = await verifyMsme(udyamInput);
      setUdyamResult(res);
    } catch (err) {
      setUdyamResult({ valid: false, message: 'Udyam lookup request failed' });
    } finally {
      setUdyamLoading(false);
    }
  };

  const handlePanLookup = async (e) => {
    e.preventDefault();
    if (!panInput.trim()) return;
    setPanLoading(true);
    try {
      const res = await verifyPan(panInput);
      setPanResult(res);
    } catch (err) {
      setPanResult({ valid: false, message: 'PAN lookup request failed' });
    } finally {
      setPanLoading(false);
    }
  };

  const handleCheckEligibility = async (e) => {
    e.preventDefault();
    setEligibilityLoading(true);
    try {
      const res = await checkEligibility({
        company_name: companyName,
        years_of_experience: Number(experience),
        has_msme_cert: Boolean(hasMsme)
      });
      setEligibilityResult(res);
    } catch (err) {
      setEligibilityResult({ is_eligible: false, status: 'Eligibility check failed' });
    } finally {
      setEligibilityLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Statutory Multi-Portal Verification Hub
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Live queries directly against GSTN, Udyam MSME, and Income Tax PAN statutory registries.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* GSTN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                GSTN Portal (15-Digit)
              </span>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                API Live
              </span>
            </div>

            <form onSubmit={handleGstnLookup} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Enter GSTIN:</label>
                <input
                  type="text"
                  value={gstinInput}
                  onChange={(e) => setGstinInput(e.target.value)}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={gstinLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {gstinLoading ? 'Verifying with GSTN...' : 'Verify GSTIN'}
              </button>
            </form>
          </div>

          {gstinResult && (
            <div className={`p-4 rounded-xl border text-xs ${
              gstinResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                {gstinResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>{gstinResult.message}</span>
              </div>
              {gstinResult.valid && (
                <div className="space-y-1 text-slate-700 pt-2 border-t border-emerald-200 font-medium">
                  <div>Legal Entity: <span className="font-bold">{gstinResult.legal_name}</span></div>
                  <div>State: <span className="font-bold">{gstinResult.state}</span></div>
                  <div>Status: <span className="font-bold text-emerald-700">{gstinResult.status}</span></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Udyam MSME */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600" />
                Udyam MSME Portal
              </span>
              <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">
                API Live
              </span>
            </div>

            <form onSubmit={handleUdyamLookup} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Enter Udyam Number:</label>
                <input
                  type="text"
                  value={udyamInput}
                  onChange={(e) => setUdyamInput(e.target.value)}
                  placeholder="e.g. UDYAM-KR-03-0028194"
                  className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={udyamLoading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {udyamLoading ? 'Querying Database...' : 'Verify Udyam'}
              </button>
            </form>
          </div>

          {udyamResult && (
            <div className={`p-4 rounded-xl border text-xs ${
              udyamResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                {udyamResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>{udyamResult.message}</span>
              </div>
              {udyamResult.valid && (
                <div className="space-y-1 text-slate-700 pt-2 border-t border-emerald-200 font-medium">
                  <div>Enterprise: <span className="font-bold">{udyamResult.enterprise_name}</span></div>
                  <div>Category: <span className="font-bold text-amber-700">{udyamResult.enterprise_type}</span></div>
                  <div>Status: <span className="font-bold text-emerald-700">{udyamResult.status}</span></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PAN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Income Tax PAN (10-Digit)
              </span>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                API Live
              </span>
            </div>

            <form onSubmit={handlePanLookup} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Enter PAN Number:</label>
                <input
                  type="text"
                  value={panInput}
                  onChange={(e) => setPanInput(e.target.value)}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={panLoading}
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {panLoading ? 'Validating PAN...' : 'Verify PAN'}
              </button>
            </form>
          </div>

          {panResult && (
            <div className={`p-4 rounded-xl border text-xs ${
              panResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                {panResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>{panResult.message}</span>
              </div>
              {panResult.valid && (
                <div className="space-y-1 text-slate-700 pt-2 border-t border-emerald-200 font-medium">
                  <div>Holder: <span className="font-bold">{panResult.holder_name}</span></div>
                  <div>Entity: <span className="font-bold">{panResult.entity_type}</span></div>
                  <div>Status: <span className="font-bold text-emerald-700">{panResult.status}</span></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Central Debarment & Blacklist Registry */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Debarment & Blacklist Registry
              </span>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full">
                Live GeM/CVC
              </span>
            </div>

            <form onSubmit={handleBlacklistLookup} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Name or PAN:</label>
                <input
                  type="text"
                  value={blacklistInput}
                  onChange={(e) => setBlacklistInput(e.target.value)}
                  placeholder="e.g. ABC INFRASTRUCTURE or PAN"
                  className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                type="submit"
                disabled={blacklistLoading}
                className="w-full bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {blacklistLoading ? 'Checking Registry...' : 'Search Debarred List'}
              </button>
            </form>
          </div>

          {blacklistResult && (
            <div className={`p-4 rounded-xl border text-xs ${
              blacklistResult.is_blacklisted ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                {blacklistResult.is_blacklisted ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span>{blacklistResult.status === 'BLACKLISTED' ? 'ENTITY IS DEBARRED' : 'CLEAR: Not Blacklisted'}</span>
              </div>
              <div className="space-y-1 text-slate-700 pt-2 border-t border-slate-200 font-medium">
                <div>{blacklistResult.message}</div>
                {blacklistResult.record && (
                  <>
                    <div>Debarred By: <span className="font-bold">{blacklistResult.record.debarred_by}</span></div>
                    <div>Order: <span className="font-bold">{blacklistResult.record.order_no}</span></div>
                    <div>Valid Until: <span className="font-bold text-rose-700">{blacklistResult.record.valid_until}</span></div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* EPFO / ESIC Portal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                EPFO / ESIC Labor Registry
              </span>
              <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full">
                API Live
              </span>
            </div>

            <form onSubmit={handleEpfoLookup} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">EPFO Code or ESIC Number:</label>
                <input
                  type="text"
                  value={epfoInput}
                  onChange={(e) => setEpfoInput(e.target.value)}
                  placeholder="e.g. KN/BNG/0028194/000 or 17-digit ESIC"
                  className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                disabled={epfoLoading}
                className="w-full bg-teal-900 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {epfoLoading ? 'Verifying Labor Record...' : 'Verify EPFO / ESIC'}
              </button>
            </form>
          </div>

          {epfoResult && (
            <div className={`p-4 rounded-xl border text-xs ${
              epfoResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                {epfoResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>{epfoResult.message}</span>
              </div>
              {epfoResult.valid && (
                <div className="space-y-1 text-slate-700 pt-2 border-t border-emerald-200 font-medium">
                  <div>Type: <span className="font-bold">{epfoResult.type}</span></div>
                  <div>Establishment: <span className="font-bold">{epfoResult.establishment_name}</span></div>
                  <div>Status: <span className="font-bold text-emerald-700">{epfoResult.status}</span></div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Interactive Eligibility Formula Sandbox */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900">
            Eligibility Sandbox: Past Experience & MSME Exemption Formula
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleCheckEligibility} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Bidder / Company Name:</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Experience (Years):</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full text-sm font-bold px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={hasMsme}
                    onChange={(e) => setHasMsme(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Has MSME / Udyam</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={eligibilityLoading}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Evaluate Eligibility Rule</span>
            </button>
          </form>

          {/* Sandbox Result */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
                Statutory Rule Formula (Public Procurement Policy 2012)
              </span>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs font-mono font-bold mb-4">
                Eligible = (Years of Experience &gt;= 3) OR (Has MSME Certificate)
              </div>
            </div>

            {eligibilityResult && (
              <div className={`p-4 rounded-xl border ${
                eligibilityResult.is_eligible ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center gap-2 font-black text-sm mb-1">
                  {eligibilityResult.is_eligible ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
                  <span>{eligibilityResult.status}</span>
                </div>
                {eligibilityResult.exemption_applied && (
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    Note: <span className="italic">{eligibilityResult.exemption_applied}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
