import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  "https://aicgrsdchvqeixsdbsyr.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_KEY ??
  "sb_publishable_jVZCpAd9ACaT-tAtNHjcrw__FQEMsaI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
