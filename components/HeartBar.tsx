"use client";

import { motion } from "framer-motion";

interface HeartBarProps {
  hearts: number;
  maxHearts: number;
  premium: boolean;
  size?: "sm" | "md" | "lg";
  showRegen?: string;  // formatted regen time string, if any
}

/**
 * Barre de vie avec cœurs animés.
 * Le dernier cœur restant "bat" doucement (pulse scale).
 */
export default function HeartBar({ hearts, maxHearts, premium, size = "sm", showRegen }: HeartBarProps) {
  const sizeClass = size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-xs";
  const isLastHeart = hearts === 1 && !premium;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxHearts }).map((_, i) => {
        const isFilled = i < hearts;
        const isTheLastOne = isLastHeart && i === 0;

        if (!isFilled) {
          return (
            <span key={i} className={`${sizeClass} opacity-20`}>🖤</span>
          );
        }

        if (isTheLastOne) {
          return (
            <motion.span
              key={i}
              animate={{
                scale: [1, 1.3, 1, 1.25, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`${sizeClass} inline-block origin-center`}
              style={{ filter: "drop-shadow(0 0 4px rgba(255,0,60,0.5))" }}
            >
              {premium ? "💛" : "❤️"}
            </motion.span>
          );
        }

        return (
          <span key={i} className={sizeClass}>
            {premium ? "💛" : "❤️"}
          </span>
        );
      })}
      {premium && (
        <span className="text-[9px] text-amber-400 ml-0.5 font-bold">∞</span>
      )}
      {showRegen && (
        <span className="text-[10px] text-slate-500 ml-1.5 nums">{showRegen}</span>
      )}
    </div>
  );
}
