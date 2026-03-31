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
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
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

            {/* Shine sweep */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute inset-y-0 w-20 animate-shine"
                style={{
                  background: `linear-gradient(90deg, transparent, ${achievement.glowColor.replace("0.5", "0.2")}, transparent)`,
                }}
              />
            </div>

            {/* Icon with pulse */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{
                scale: [0, 1.3, 1],
                rotate: [-20, 5, 0],
              }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="relative text-4xl flex-shrink-0"
            >
              {achievement.icon}
            </motion.div>

            {/* Text */}
            <div className="relative flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-2 mb-0.5"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Badge D&eacute;bloqu&eacute; !
                </span>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-amber-400 text-xs"
                >
                  ✦
                </motion.span>
              </motion.div>
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
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
