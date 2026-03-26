"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import {
  Zap,
  Shield,
  Flame,
  Ghost,
  Bot,
  Skull,
} from "lucide-react";

export const AVATARS = [
  { id: "zap", label: "Volt", Icon: Zap, color: "#00f0ff", bg: "bg-cyan-500/15", border: "border-cyan-500/30", shadow: "shadow-cyan-500/20" },
  { id: "shield", label: "Aegis", Icon: Shield, color: "#a855f7", bg: "bg-purple-500/15", border: "border-purple-500/30", shadow: "shadow-purple-500/20" },
  { id: "flame", label: "Blaze", Icon: Flame, color: "#ff2d7b", bg: "bg-rose-500/15", border: "border-rose-500/30", shadow: "shadow-rose-500/20" },
  { id: "ghost", label: "Specter", Icon: Ghost, color: "#34d399", bg: "bg-emerald-500/15", border: "border-emerald-500/30", shadow: "shadow-emerald-500/20" },
  { id: "bot", label: "Nexus", Icon: Bot, color: "#f59e0b", bg: "bg-amber-500/15", border: "border-amber-500/30", shadow: "shadow-amber-500/20" },
  { id: "skull", label: "Reaper", Icon: Skull, color: "#f43f5e", bg: "bg-red-500/15", border: "border-red-500/30", shadow: "shadow-red-500/20" },
] as const;

export function getAvatarById(id: string) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

export default function OnboardingModal() {
  const { hydrated, hasProfile, createProfile } = useProfile();
  const [pseudo, setPseudo] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0].id);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);

  if (!hydrated || hasProfile || closing) return null;

  const handleSubmit = () => {
    const trimmed = pseudo.trim();
    if (trimmed.length < 2) {
      setError("Le pseudo doit faire au moins 2 caractères");
      return;
    }
    if (trimmed.length > 20) {
      setError("Le pseudo ne peut pas dépasser 20 caractères");
      return;
    }
    createProfile(trimmed, selectedAvatar);
    setClosing(true);
  };

  const avatar = getAvatarById(selectedAvatar);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="glass-card-strong max-w-md w-full p-8 relative overflow-hidden"
        >
          {/* Background orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/[0.06] rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-rose/[0.04] rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="text-5xl mb-3 inline-block"
              >
                🧠
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Initialisation du <span className="gradient-text">Profil</span>
              </h2>
              <p className="text-slate-500 text-sm">Créez votre identité de joueur</p>
            </div>

            {/* Pseudo Input */}
            <div className="mb-6">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                Pseudo
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => { setPseudo(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="Entrez votre pseudo..."
                maxLength={20}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20 transition-all text-sm"
                autoFocus
              />
              {error && (
                <p className="text-neon-rose text-xs mt-1.5">{error}</p>
              )}
            </div>

            {/* Avatar Selection */}
            <div className="mb-6">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 block">
                Avatar Cyberpunk
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AVATARS.map((av, i) => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <motion.button
                      key={av.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? `${av.bg} ${av.border} shadow-lg ${av.shadow}`
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                      }`}
                    >
                      <av.Icon
                        size={28}
                        strokeWidth={isSelected ? 2.5 : 1.8}
                        style={{ color: isSelected ? av.color : "#64748b" }}
                        className="transition-colors"
                      />
                      <span className={`text-[11px] font-semibold ${isSelected ? "text-white" : "text-slate-600"}`}>
                        {av.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          layoutId="avatar-check"
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                          style={{ backgroundColor: av.color }}
                        >
                          <span className="text-black font-bold">&#10003;</span>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
              <div
                className={`w-10 h-10 rounded-full ${avatar.bg} border ${avatar.border} flex items-center justify-center`}
              >
                <avatar.Icon size={20} style={{ color: avatar.color }} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  {pseudo.trim() || "Pseudo..."}
                </p>
                <p className="text-slate-600 text-[10px]">Aperçu du profil</p>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-opacity shadow-xl shadow-neon-cyan/15"
            >
              C&apos;est parti !
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
