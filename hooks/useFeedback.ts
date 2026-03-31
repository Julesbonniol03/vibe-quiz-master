"use client";

import { useCallback, useRef } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// ─── Audio (Web Audio API — no files needed) ───

function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (sharedCtx && sharedCtx.state !== "closed") return sharedCtx;
  sharedCtx = createAudioContext();
  return sharedCtx;
}

/** Tech "click" — short descending sine */
function playClick() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(1800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

/** Rising "ding" for correct answer */
function playDing() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

/** Low double-buzz for wrong answer */
function playBuzz() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.type = "square";
  osc1.frequency.setValueAtTime(150, ctx.currentTime);
  gain1.gain.setValueAtTime(0.12, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.1);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.type = "square";
  osc2.frequency.setValueAtTime(120, ctx.currentTime + 0.12);
  gain2.gain.setValueAtTime(0.001, ctx.currentTime);
  gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
  osc2.start(ctx.currentTime + 0.12);
  osc2.stop(ctx.currentTime + 0.22);
}

// ─── Haptics (Capacitor native on iOS/Android, fallback to navigator.vibrate on web) ───

async function hapticsImpact(style: ImpactStyle = ImpactStyle.Light) {
  try {
    await Haptics.impact({ style });
  } catch {
    // Fallback for web
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(style === ImpactStyle.Heavy ? 50 : 20);
    }
  }
}

async function hapticsNotification(type: NotificationType) {
  try {
    await Haptics.notification({ type });
  } catch {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(type === NotificationType.Error ? [30, 50, 30] : 40);
    }
  }
}

// ─── Hook ───

export function useFeedback() {
  const lastRef = useRef(0);

  const clickFeedback = useCallback(() => {
    playClick();
    hapticsImpact(ImpactStyle.Light);
  }, []);

  const correctFeedback = useCallback(() => {
    const now = Date.now();
    if (now - lastRef.current < 150) return;
    lastRef.current = now;
    playClick();
    setTimeout(playDing, 60);
    hapticsNotification(NotificationType.Success);
  }, []);

  const wrongFeedback = useCallback(() => {
    const now = Date.now();
    if (now - lastRef.current < 150) return;
    lastRef.current = now;
    playClick();
    setTimeout(playBuzz, 60);
    hapticsNotification(NotificationType.Error);
  }, []);

  return { clickFeedback, correctFeedback, wrongFeedback };
}
