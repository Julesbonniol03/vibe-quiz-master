"use client";

import { useState, useCallback, type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RippleData {
  id: number;
  x: number;
  y: number;
}

interface NeonRippleProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  color?: string;       // rgba color for the ripple (default neon-green)
  as?: "button" | "a" | "div";
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean;
}

let rippleCounter = 0;

/**
 * Bouton avec onde de choc néon au clic.
 * Un cercle lumineux explose depuis le point de clic et s'estompe.
 */
export default function NeonRipple({
  children,
  className = "",
  style,
  color = "rgba(0,255,65,0.25)",
  onClick,
  disabled,
}: NeonRippleProps) {
  const [ripples, setRipples] = useState<RippleData[]>([]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++rippleCounter;

      setRipples((prev) => [...prev, { id, x, y }]);

      // Clean up after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);

      onClick?.(e);
    },
    [onClick]
  );

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      style={style}
      onClick={handleClick}
      disabled={disabled}
    >
      {/* Ripple waves */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 0.6,
            }}
            animate={{
              width: 300,
              height: 300,
              x: ripple.x - 150,
              y: ripple.y - 150,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              boxShadow: `0 0 20px ${color}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
