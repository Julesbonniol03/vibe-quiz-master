"use client";

import { useState, useEffect, useCallback } from "react";
import { useOptionalAuth } from "@/contexts/AuthContext";

const KEY_HEARTS = "inkult_hearts";
const KEY_HEARTS_TS = "inkult_hearts_ts"; // timestamp of last heart loss
const KEY_PREMIUM = "inkult_premium";

const MAX_HEARTS = 5;
const REGEN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes per heart

interface HeartsState {
  hearts: number;
  lastLostAt: number; // timestamp
}

function loadHearts(): HeartsState {
  if (typeof window === "undefined") return { hearts: MAX_HEARTS, lastLostAt: 0 };
  try {
    const h = JSON.parse(localStorage.getItem(KEY_HEARTS) || String(MAX_HEARTS));
    const ts = JSON.parse(localStorage.getItem(KEY_HEARTS_TS) || "0");
    return { hearts: h, lastLostAt: ts };
  } catch {
    return { hearts: MAX_HEARTS, lastLostAt: 0 };
  }
}

function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return JSON.parse(localStorage.getItem(KEY_PREMIUM) || "false");
  } catch {
    return false;
  }
}

export function useHearts() {
  const auth = useOptionalAuth();
  const premium = auth?.profile?.premium_status || isPremium();

  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [lastLostAt, setLastLostAt] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [nextRegenIn, setNextRegenIn] = useState(0); // seconds until next heart

  // Hydrate + apply regeneration
  useEffect(() => {
    const state = loadHearts();
    let currentHearts = state.hearts;
    const ts = state.lastLostAt;

    // Calculate regenerated hearts
    if (currentHearts < MAX_HEARTS && ts > 0) {
      const elapsed = Date.now() - ts;
      const regenCount = Math.floor(elapsed / REGEN_INTERVAL_MS);
      if (regenCount > 0) {
        currentHearts = Math.min(MAX_HEARTS, currentHearts + regenCount);
        localStorage.setItem(KEY_HEARTS, JSON.stringify(currentHearts));
        if (currentHearts >= MAX_HEARTS) {
          localStorage.setItem(KEY_HEARTS_TS, "0");
        }
      }
    }

    setHearts(currentHearts);
    setLastLostAt(ts);
    setHydrated(true);
  }, []);

  // Countdown timer for next regen
  useEffect(() => {
    if (hearts >= MAX_HEARTS || lastLostAt === 0 || premium) {
      setNextRegenIn(0);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - lastLostAt;
      const heartsRegened = Math.floor(elapsed / REGEN_INTERVAL_MS);
      const effectiveHearts = Math.min(MAX_HEARTS, hearts + heartsRegened);

      if (effectiveHearts >= MAX_HEARTS) {
        setHearts(MAX_HEARTS);
        localStorage.setItem(KEY_HEARTS, JSON.stringify(MAX_HEARTS));
        localStorage.setItem(KEY_HEARTS_TS, "0");
        setNextRegenIn(0);
        return;
      }

      // Time until next regen
      const nextRegenAt = lastLostAt + (heartsRegened + 1) * REGEN_INTERVAL_MS;
      const remaining = Math.max(0, Math.ceil((nextRegenAt - Date.now()) / 1000));
      setNextRegenIn(remaining);

      if (heartsRegened > 0 && effectiveHearts > hearts) {
        setHearts(effectiveHearts);
        localStorage.setItem(KEY_HEARTS, JSON.stringify(effectiveHearts));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [hearts, lastLostAt, premium]);

  const loseHeart = useCallback(() => {
    if (premium) return; // Premium = infinite
    setHearts((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem(KEY_HEARTS, JSON.stringify(next));
      const now = Date.now();
      localStorage.setItem(KEY_HEARTS_TS, JSON.stringify(now));
      setLastLostAt(now);
      return next;
    });
  }, [premium]);

  const refillHearts = useCallback(() => {
    setHearts(MAX_HEARTS);
    localStorage.setItem(KEY_HEARTS, JSON.stringify(MAX_HEARTS));
    localStorage.setItem(KEY_HEARTS_TS, "0");
    setLastLostAt(0);
  }, []);

  const earnBonusHeart = useCallback(() => {
    if (premium) return;
    setHearts((prev) => {
      const next = Math.min(MAX_HEARTS + 1, prev + 1); // Can go to 6 with bonus
      localStorage.setItem(KEY_HEARTS, JSON.stringify(next));
      return next;
    });
  }, [premium]);

  const canPlay = premium || hearts > 0;

  const formatRegenTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return {
    hearts,
    maxHearts: MAX_HEARTS,
    canPlay,
    premium,
    hydrated,
    nextRegenIn,
    formatRegenTime,
    loseHeart,
    refillHearts,
    earnBonusHeart,
  };
}
