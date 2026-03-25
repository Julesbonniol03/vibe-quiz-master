"use client";

import { useEffect } from "react";

const KEY_PREFETCHED = "vqm_questions_prefetched";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed silently (dev mode, etc.)
      });
    }

    // Pre-fetch all questions into cache on first visit
    if (!localStorage.getItem(KEY_PREFETCHED)) {
      prefetchQuestions();
    }
  }, []);

  return null;
}

async function prefetchQuestions() {
  try {
    // Fetch categories first to know what's available
    const catRes = await fetch("/api/categories");
    if (!catRes.ok) return;
    const catData = await catRes.json();
    const categories: string[] = catData.categories?.map((c: { name: string }) => c.name) || [];

    // Pre-fetch a large batch per category to populate the SW cache
    const fetches = categories.map((cat) =>
      fetch(`/api/questions/random?category=${encodeURIComponent(cat)}&limit=50`)
        .catch(() => null)
    );

    // Also fetch the all-categories pool
    fetches.push(
      fetch("/api/questions/random?limit=50").catch(() => null)
    );

    await Promise.all(fetches);
    localStorage.setItem(KEY_PREFETCHED, Date.now().toString());
  } catch {
    // Silent fail — will retry on next visit
  }
}
