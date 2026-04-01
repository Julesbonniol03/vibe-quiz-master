"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Height: "auto" | "half" | "full" */
  height?: "auto" | "half" | "full";
}

/**
 * Bottom Sheet — tiroir qui monte du bas de l'écran.
 * Swipe-down pour fermer. Backdrop blur.
 */
export default function BottomSheet({ open, onClose, children, title, height = "auto" }: BottomSheetProps) {
  const dragControls = useDragControls();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleDragEnd = useCallback((_: never, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 300) {
      onClose();
    }
  }, [onClose]);

  const heightClass = height === "full"
    ? "max-h-[92vh]"
    : height === "half"
    ? "max-h-[55vh]"
    : "max-h-[85vh]";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className={`fixed bottom-0 left-0 right-0 z-[81] ${heightClass} flex flex-col rounded-t-3xl overflow-hidden`}
            style={{
              background: "linear-gradient(180deg, rgba(18,18,18,0.98), rgba(10,10,10,0.99))",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-white/[0.15]" />
            </div>

            {/* Title */}
            {title && (
              <div className="px-5 pb-3 flex items-center justify-between border-b border-white/[0.04]">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-slate-400 hover:text-white transition-all text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
