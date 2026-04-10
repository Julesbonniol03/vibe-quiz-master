"use client";

import { useState, useEffect, useCallback } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { motion, AnimatePresence } from "framer-motion";

const KEY_NOTIF_PERMISSION = "inkult_notif_granted";
const KEY_NOTIF_DISMISSED = "inkult_notif_dismissed";

// ─── Schedule local notifications (works on web + native) ───

async function requestPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === "granted";
  } catch {
    // Fallback: try web Notification API
    if (typeof Notification !== "undefined") {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
    return false;
  }
}

async function scheduleStreakReminder(streakDays: number) {
  try {
    // Schedule for 19h today (or tomorrow if past 19h)
    const now = new Date();
    const target = new Date();
    target.setHours(19, 0, 0, 0);
    if (now >= target) target.setDate(target.getDate() + 1);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: "🔥 Ta série va s'éteindre !",
          body: `Hé Inkult ! Ta série de ${streakDays} jour${streakDays > 1 ? "s" : ""} va s'éteindre. Viens sauver ta flamme !`,
          schedule: { at: target },
          sound: "default",
          actionTypeId: "STREAK_REMINDER",
        },
      ],
    });
  } catch {
    // Silently fail on unsupported platforms
  }
}

async function scheduleHeartsFullNotification(regenTimeMs: number) {
  try {
    if (regenTimeMs <= 0) return;
    const at = new Date(Date.now() + regenTimeMs);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1002,
          title: "❤️ Cœurs rechargés !",
          body: "Ton cerveau est reposé. Prêt pour un 10/10 ?",
          schedule: { at },
          sound: "default",
          actionTypeId: "HEARTS_FULL",
        },
      ],
    });
  } catch {
    // Silently fail
  }
}

async function scheduleNewContentNotification(title: string, body: string, delayMs: number = 0) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1003 + Math.floor(Math.random() * 1000),
          title,
          body,
          schedule: delayMs > 0 ? { at: new Date(Date.now() + delayMs) } : undefined,
          sound: "default",
          actionTypeId: "NEW_CONTENT",
        },
      ],
    });
  } catch {
    // Silently fail
  }
}

async function cancelAllReminders() {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  } catch {
    // Silently fail
  }
}

// ─── Permission prompt component ───

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    // Don't show if already granted or dismissed
    const wasGranted = localStorage.getItem(KEY_NOTIF_PERMISSION) === "true";
    const wasDismissed = localStorage.getItem(KEY_NOTIF_DISMISSED) === "true";
    if (wasGranted || wasDismissed) {
      setGranted(wasGranted);
      return;
    }

    // Show after 10 seconds (let user settle in first)
    const timer = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = async () => {
    const ok = await requestPermission();
    if (ok) {
      localStorage.setItem(KEY_NOTIF_PERMISSION, "true");
      setGranted(true);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(KEY_NOTIF_DISMISSED, "true");
    setShow(false);
  };

  if (granted || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="fixed bottom-24 left-4 right-4 z-[9990] max-w-md mx-auto"
      >
        <div className="glass-card-strong !rounded-3xl p-6 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-green/[0.08] rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-red/[0.06] rounded-full blur-[50px] pointer-events-none" />

          <div className="relative z-10">
            {/* Icon */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl"
              >
                🔔
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-base">Reste dans la boucle, Inkult</h3>
                <p className="text-slate-500 text-xs">On te préviendra au bon moment</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-4">
              {[
                { icon: "🔥", text: "Rappel avant de perdre ta série" },
                { icon: "❤️", text: "Alerte quand tes cœurs sont pleins" },
                { icon: "📰", text: "Nouvelles questions disponibles" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-slate-400 text-xs">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm font-medium hover:bg-white/8 transition-colors"
              >
                Plus tard
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAccept}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-neon-red text-white text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-neon-green/15"
              >
                Activer 🔔
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Hook for scheduling notifications ───

export function useNotifications() {
  const isGranted = typeof window !== "undefined" && localStorage.getItem(KEY_NOTIF_PERMISSION) === "true";

  const scheduleStreakAlert = useCallback((streakDays: number) => {
    if (!isGranted || streakDays <= 0) return;
    scheduleStreakReminder(streakDays);
  }, [isGranted]);

  const scheduleHeartsAlert = useCallback((timeUntilFullMs: number) => {
    if (!isGranted) return;
    scheduleHeartsFullNotification(timeUntilFullMs);
  }, [isGranted]);

  const notifyNewContent = useCallback((title: string, body: string) => {
    if (!isGranted) return;
    scheduleNewContentNotification(title, body);
  }, [isGranted]);

  const cancelAll = useCallback(() => {
    cancelAllReminders();
  }, []);

  return {
    isGranted,
    scheduleStreakAlert,
    scheduleHeartsAlert,
    notifyNewContent,
    cancelAll,
  };
}
