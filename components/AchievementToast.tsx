"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/hooks/useAchievements";

interface Props {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: Props) {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9000] max-w-sm w-[90vw]"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border bg-cyber-900/95 backdrop-blur-xl p-4 flex items-center gap-4"
            style={{
              borderColor: achievement.glowColor.replace("0.5", "0.3"),
              boxShadow: `0 0 20px ${achievement.glowColor.replace("0.5", "0.2")}, 0 0 50px ${achievement.glowColor.replace("0.5", "0.08")}`,
            }}
          >
            {/* Glow background */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 30% 50%, ${achievement.glowColor}, transparent 70%)`,
              }}
            />

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.15 }}
              className="relative text-4xl flex-shrink-0"
            >
              {achievement.icon}
            </motion.div>

            {/* Text */}
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Badge débloqué !
                </span>
              </div>
              <p className={`font-bold text-sm ${achievement.color}`}>
                {achievement.name}
              </p>
              <p className="text-slate-500 text-xs truncate">
                {achievement.desc}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              className="relative text-slate-600 hover:text-slate-300 transition-colors p-1 flex-shrink-0"
            >
              &#10005;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
