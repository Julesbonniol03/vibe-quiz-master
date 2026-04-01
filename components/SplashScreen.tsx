"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KEY_SPLASH_SEEN = "vqm_splash_seen";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show splash once per session
    if (sessionStorage.getItem(KEY_SPLASH_SEEN)) return;
    setVisible(true);
    sessionStorage.setItem(KEY_SPLASH_SEEN, "1");
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-obsidian-950"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          {/* Deep obsidian mesh orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.04, 0.12, 0.04] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(0,255,65,0.12) 0%, transparent 60%)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.08, 0.03] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,0,60,0.1) 0%, transparent 60%)" }}
            />
            {/* Gold accent orb */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.02, 0.06, 0.02] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,183,0,0.08) 0%, transparent 60%)" }}
            />
          </div>

          {/* Logo with premium neon pulse */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.45, duration: 0.9 }}
            className="relative mb-8"
          >
            {/* Outer neon glow ring */}
            <motion.div
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #00FF41, #a78bfa, #FF003C)",
                filter: "blur(25px)",
                margin: "-16px",
              }}
            />
            {/* Logo card — obsidian glass */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0,255,65,0.2), 0 0 60px rgba(0,255,65,0.08)",
                  "0 0 40px rgba(0,255,65,0.4), 0 0 100px rgba(0,255,65,0.15), 0 0 140px rgba(255,0,60,0.1)",
                  "0 0 20px rgba(0,255,65,0.2), 0 0 60px rgba(0,255,65,0.08)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-neon-green via-obsidian-600 to-neon-red flex items-center justify-center"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 16px 48px rgba(0,0,0,0.5)",
              }}
            >
              <span className="text-white font-black text-6xl select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">T</span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl font-black mb-2 tracking-tight"
          >
            <span className="bg-gradient-to-r from-neon-green via-white to-neon-red bg-clip-text text-transparent">
              Teub&eacute;
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-slate-500 text-sm tracking-wider uppercase font-medium"
          >
            L&apos;&eacute;lite de la Culture G
          </motion.p>

          {/* Loading bar — obsidian */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 w-44 h-1 bg-white/[0.04] rounded-full overflow-hidden"
            style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.9, duration: 1.3, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-neon-green via-obsidian-600 to-neon-red"
              style={{ boxShadow: "0 0 12px rgba(0,255,65,0.4)" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
