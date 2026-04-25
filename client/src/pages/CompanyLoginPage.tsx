import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { Building2, Lock, Mail, Loader2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

const CompanyLoginPage: React.FC = () => {
  const { companyLogin, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  // Redirect if already logged in as company
  useEffect(() => {
    if (user?.role === "company") navigate("/company/dashboard");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await companyLogin(email, password);
      navigate("/company/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── Animated background orbs ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/6 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/4 rounded-full blur-3xl"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
      </div>

      {/* ── Card ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative w-20 h-20 mx-auto mb-5"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-900" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl font-black text-white">
              Career<span className="text-emerald-400">Connect</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Company Portal</p>
          </motion.div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white/4 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-0.5">Sign in to discover top developer talent</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl mb-5 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-gray-400 text-xs font-medium mb-2 block uppercase tracking-wider">
                Company Email
              </label>
              <div className={`relative group transition-all ${focusedField === "email" ? "scale-[1.01]" : ""}`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "email" ? "text-emerald-400" : "text-gray-600"}`} />
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="company@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-xs font-medium mb-2 block uppercase tracking-wider">
                Password
              </label>
              <div className={`relative transition-all ${focusedField === "password" ? "scale-[1.01]" : ""}`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "password" ? "text-emerald-400" : "text-gray-600"}`} />
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                <><Building2 className="w-4 h-4" /> Sign In as Company <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
            <p className="text-emerald-500 text-xs text-center font-medium mb-1">Demo Credentials</p>
            <p className="text-gray-500 text-xs text-center font-mono">company@careerconnect.com</p>
            <p className="text-gray-600 text-xs text-center font-mono">Company@123</p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-700 text-sm mt-6">
          Are you a developer?{" "}
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Login here →
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default CompanyLoginPage;
