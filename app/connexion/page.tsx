"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AVATARS, getAvatarById } from "@/components/OnboardingModal";

type Mode = "login" | "signup";

export default function ConnexionPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [avatarId, setAvatarId] = useState("hacker");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const hasLocalXp = (() => {
    if (typeof window === "undefined") return false;
    try {
      return (JSON.parse(localStorage.getItem("vqm_xp") || "0")) > 0;
    } catch { return false; }
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "signup") {
      if (pseudo.trim().length < 2) {
        setError("Le pseudo doit faire au moins 2 caractères");
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, pseudo.trim(), avatarId);
      if (err) {
        setError(err);
      } else {
        setSuccess("Compte créé ! Vérifie ton email pour confirmer ton inscription.");
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  const avatar = getAvatarById(avatarId);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-red/[0.03] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-red flex items-center justify-center text-2xl font-black text-white mx-auto mb-4 shadow-lg shadow-neon-green/20"
          >
            T
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {mode === "login" ? "Content de te revoir" : "Rejoins les "}
            {mode === "signup" && <span className="gradient-text">Teubés</span>}
          </h1>
          <p className="text-slate-500 text-sm">
            {mode === "login"
              ? "Connecte-toi pour retrouver ta progression"
              : "Crée ton compte pour sauvegarder ton XP"}
          </p>
        </div>

        {/* Migration banner */}
        {mode === "signup" && hasLocalXp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-amber-400 text-sm font-semibold">XP détectée en local</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Ton XP sera automatiquement transférée sur ton compte à l&apos;inscription.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card-strong !rounded-2xl p-6 space-y-4">

            {/* Mode toggle */}
            <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-1">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-gradient-to-r from-neon-green/20 to-neon-red/20 text-white border border-white/10"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {m === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>

            {/* Pseudo (signup only) */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                    Pseudo
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="text"
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                      placeholder="Ton pseudo de Teubé..."
                      maxLength={20}
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.fr"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Avatar selection (signup only) */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                    Ton avatar
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATARS.map((av) => {
                      const selected = avatarId === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setAvatarId(av.id)}
                          className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                            selected
                              ? `${av.bg} ${av.border} shadow-lg ${av.shadow}`
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                          }`}
                        >
                          <av.Icon
                            size={20}
                            strokeWidth={selected ? 2.5 : 1.8}
                            style={{ color: selected ? av.color : "#64748b" }}
                          />
                          {selected && (
                            <div
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-black"
                              style={{ backgroundColor: av.color }}
                            >
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Preview */}
                  <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className={`w-9 h-9 rounded-full ${avatar.bg} border ${avatar.border} flex items-center justify-center`}>
                      <avatar.Icon size={18} style={{ color: avatar.color }} strokeWidth={2.2} />
                    </div>
                    <span className="text-white text-sm font-semibold">{pseudo.trim() || "Pseudo..."}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-neon-red/[0.08] border border-neon-red/20 text-neon-red text-sm text-center"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-green-500/[0.08] border border-green-500/20 text-green-400 text-sm text-center"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-neon-green to-neon-red text-white font-bold text-base rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-neon-green/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Bottom link */}
        <p className="text-center text-slate-600 text-sm mt-6">
          {mode === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="text-neon-green hover:underline font-medium">
                Inscris-toi
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-neon-green hover:underline font-medium">
                Connecte-toi
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
