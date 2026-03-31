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
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-cyber-950"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          {/* Mesh background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.1, 0.04] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,45,123,0.12) 0%, transparent 70%)" }}
            />
          </div>

          {/* Logo with neon pulse */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="relative mb-8"
          >
            {/* Outer neon glow ring */}
            <motion.div
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #00f0ff, #ff2d7b)",
                filter: "blur(20px)",
                margin: "-12px",
              }}
            />
            {/* Logo card */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1)",
                  "0 0 40px rgba(0,240,255,0.5), 0 0 80px rgba(0,240,255,0.2), 0 0 120px rgba(255,45,123,0.15)",
                  "0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1)",
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-neon-cyan to-neon-rose flex items-center justify-center"
            >
              <span className="text-white font-black text-6xl select-none drop-shadow-lg">T</span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl font-black mb-2 tracking-tight"
          >
            <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-rose bg-clip-text text-transparent">
              Teubé
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-slate-500 text-sm tracking-wide"
          >
            Le quiz des Teubés · 1000+ Questions
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 w-40 h-1 bg-white/[0.06] rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.9, duration: 1.2, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose"
              style={{ boxShadow: "0 0 10px rgba(0,240,255,0.5)" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
