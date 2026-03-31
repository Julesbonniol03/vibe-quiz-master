"use client";

import { useCallback, useRef } from "react";

// Generates short synthetic sounds via Web Audio API — no audio files needed.
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

/** Short rising "ding" for correct answer */
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

  // First buzz
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

  // Second buzz (delayed)
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

/** Short tech "click" sound on any answer tap */
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

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function useFeedback() {
  // Guard against rapid re-fires
  const lastRef = useRef(0);

  const clickFeedback = useCallback(() => {
    playClick();
    vibrate(15); // micro tap
  }, []);

  const correctFeedback = useCallback(() => {
    const now = Date.now();
    if (now - lastRef.current < 150) return;
    lastRef.current = now;
    playClick();
    setTimeout(playDing, 60); // click then ding
    vibrate(40);
  }, []);

  const wrongFeedback = useCallback(() => {
    const now = Date.now();
    if (now - lastRef.current < 150) return;
    lastRef.current = now;
    playClick();
    setTimeout(playBuzz, 60); // click then buzz
    vibrate([30, 50, 30]);
  }, []);

  return { clickFeedback, correctFeedback, wrongFeedback };
}
