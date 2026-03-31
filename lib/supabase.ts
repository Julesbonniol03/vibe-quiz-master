"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://aicgrsdchvqeixsdbsyr.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpY2dyc2RjaHZxZWl4c2Ric3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNTU1MzcsImV4cCI6MjA1ODczMTUzN30.sb_publishable_jVZCpAd9ACaT-tAtNHjcrw__FQEMsaI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "teube_auth",
  },
});
