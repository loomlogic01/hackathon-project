import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldHalf, Lock, Mail, Loader2 } from "lucide-react";
import { Input, Checkbox } from "../components/Input";
import Button from "../components/Button";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("officer@cpcl.gov.in");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    await login({ email, password });
    setLoading(false);
    navigate("/dashboard");
  }

  async function handleDemoLogin() {
    setLoading(true);
    await login({ email: "demo@cpcl.gov.in" });
    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <ShieldHalf size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BidSure AI</h1>
          <p className="text-sm text-slate-400 mt-1 text-center">
            AI-assisted bid compliance verification with evidence-backed decisions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-7">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide mb-5">
            Government Procurement Compliance Platform
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Input
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@department.gov.in"
                required
                className="[&_input]:pl-9"
              />
              <Mail size={15} className="absolute left-3 top-[38px] text-slate-400" />
            </div>

            <div className="relative">
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="[&_input]:pl-9"
              />
              <Lock size={15} className="absolute left-3 top-[38px] text-slate-400" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Checkbox id="remember" label="Remember me" checked={remember} onChange={() => setRemember(!remember)} />
              <button type="button" className="text-xs font-medium text-navy-700 hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Login"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] text-slate-400 uppercase">or</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <Button variant="secondary" className="w-full" onClick={handleDemoLogin} disabled={loading}>
            Continue with Demo Login
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Prototype build — SIH Hackathon · Not for production procurement use
        </p>
      </div>
    </div>
  );
}
