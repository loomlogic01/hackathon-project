import React, { useState } from 'react';
import { Shield, Lock, User, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('officer@gem.gov.in');
  const [officerId, setOfficerId] = useState('GEM-PO-2026');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('Senior Procurement Officer (Tender Authority)');
  const [error, setError] = useState('');
  const API_BASE_URL = 'https://gem-bid-compliance-1.onrender.com'
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || officerId,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed. Please check your credentials.');
    }
    localStorage.setItem('officer', JSON.stringify(data.officer));
    if (onLogin) onLogin(data.officer);
  } catch (err) {
    setError(err.message);
  }
  };

  const handleQuickDemoLogin = () => {
    onLogin({
      id: 'GEM-PO-2026',
      name: 'Rajesh Kumar',
      role: 'Senior Procurement Officer (Tender Authority)',
      department: 'Ministry of Commerce & Industry',
      clearance: 'Level-3 Tender Authority'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Top Tricolor Accent Line */}
      <div className="h-1.5 w-full grid grid-cols-3 fixed top-0 left-0 right-0 z-30">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#138808]"></div>
      </div>

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="pt-8 px-6 sm:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg border border-blue-400/30">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
              Government of India
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">
              Government e-Marketplace (GeM)
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>GeM Compliance AI Engine Active</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-1">
              <Lock className="w-7 h-7 text-amber-300" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Officer Portal Sign In
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in to access the AI Tender Bid Compliance & Statutory Evaluation System.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Officer ID */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Officer ID / Official Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. GEM-PO-2026"
                  className="w-full text-sm font-medium bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Password / Security PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-sm font-medium bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Role Designation */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Tender Authority Designation
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Senior Procurement Officer (Tender Authority)">
                  Senior Procurement Officer (Tender Authority)
                </option>
                <option value="Technical Evaluation Committee Chair">
                  Technical Evaluation Committee Chair
                </option>
                <option value="Statutory Compliance Auditor (GeM)">
                  Statutory Compliance Auditor (GeM)
                </option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Sign In to Evaluation Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Quick Demo 1-Click Login Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleQuickDemoLogin}
              type="button"
              className="w-full bg-slate-800/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>1-Click Demo Login (Rajesh Kumar, PO-14)</span>
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-500 leading-relaxed">
            Protected under Government of India Cyber Security Policy & General Financial Rules (GFR 2017).
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/80">
        Government e-Marketplace (GeM) • AI Statutory Verification Platform
      </footer>

    </div>
  );
}
