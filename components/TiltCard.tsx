"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tiltMax?: number;     // max tilt degrees (default 6)
  glowOnTilt?: boolean; // show neon edge glow on tilt
}

/**
 * Carte avec effet de tilt 3D au survol/toucher.
 * Pivote l&eacute;g&egrave;rement vers le pointeur pour un ressenti "physique".
 */
export default function TiltCard({ children, className = "", style, tiltMax = 6, glowOnTilt = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltMax, -tiltMax]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltMax, tiltMax]), { stiffness: 300, damping: 20 });

  // Edge glow position — hooks called unconditionally
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, 80]), { stiffness: 200, damping: 25 });
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, 80]), { stiffness: 200, damping: 25 });
  const glowOpacity = useMotionValue(0);
  const glowOpacitySmooth = useSpring(glowOpacity, { stiffness: 200, damping: 30 });
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(0,255,65,0.06) 0%, transparent 60%)`
  );

  function handlePointerMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    glowOpacity.set(1);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
    glowOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
        ...style,
      }}
      className={className}
    >
      {/* Tilt glow overlay */}
      {glowOnTilt && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
          style={{
            opacity: glowOpacitySmooth,
            background: glowBackground,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
