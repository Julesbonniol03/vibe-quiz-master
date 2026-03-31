"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface SupabaseProfile {
  id: string;
  pseudo: string;
  avatar_id: string;
  xp: number;
  games_played: number;
  total_played: number;
  total_correct: number;
  best_streak: number;
  daily_streak: number;
  daily_last_date: string;
  daily_completed: string;
  premium_status: boolean;
  category_stats: Record<string, { played: number; correct: number }>;
  speed_record: { totalTime: number; totalAnswered: number; bestAvg: number };
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: SupabaseProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, pseudo: string, avatarId: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileField: (fields: Partial<SupabaseProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as SupabaseProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // Listen to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, pseudo: string, avatarId: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: translateAuthError(error.message) };
    if (!data.user) return { error: "Erreur inconnue" };

    // Migrate localStorage XP if any
    let localXp = 0;
    let localGames = 0;
    let localPlayed = 0;
    let localCorrect = 0;
    let localBestStreak = 0;
    let localDailyStreak = 0;
    let localDailyLastDate = "";
    let localDailyCompleted = "";
    let localCategoryStats = {};
    let localSpeedRecord = { totalTime: 0, totalAnswered: 0, bestAvg: 0 };

    try {
      localXp = JSON.parse(localStorage.getItem("vqm_xp") || "0");
      localGames = JSON.parse(localStorage.getItem("vqm_games") || "0");
      localPlayed = JSON.parse(localStorage.getItem("vqm_played") || "0");
      localCorrect = JSON.parse(localStorage.getItem("vqm_correct") || "0");
      localBestStreak = JSON.parse(localStorage.getItem("vqm_best_streak") || "0");
      localDailyStreak = JSON.parse(localStorage.getItem("vqm_daily_streak") || "0");
      localDailyLastDate = localStorage.getItem("vqm_daily_last_date") || "";
      localDailyCompleted = localStorage.getItem("vqm_daily_completed") || "";
      localCategoryStats = JSON.parse(localStorage.getItem("vqm_category_stats") || "{}");
      localSpeedRecord = JSON.parse(localStorage.getItem("vqm_speed_records") || '{"totalTime":0,"totalAnswered":0,"bestAvg":0}');
    } catch { /* ignore parse errors */ }

    // Create profile row
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      pseudo,
      avatar_id: avatarId,
      xp: localXp,
      games_played: localGames,
      total_played: localPlayed,
      total_correct: localCorrect,
      best_streak: localBestStreak,
      daily_streak: localDailyStreak,
      daily_last_date: localDailyLastDate,
      daily_completed: localDailyCompleted,
      category_stats: localCategoryStats,
      speed_record: localSpeedRecord,
    });

    if (profileError) return { error: "Profil non créé : " + profileError.message };

    await fetchProfile(data.user.id);
    return { error: null };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const updateProfileField = useCallback(async (fields: Partial<SupabaseProfile>) => {
    if (!user) return;
    await supabase.from("profiles").update(fields).eq("id", user.id);
    setProfile((prev) => prev ? { ...prev, ...fields } : prev);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, refreshProfile, updateProfileField }}>
      {children}
    </AuthContext.Provider>
  );
}

function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login")) return "Email ou mot de passe incorrect";
  if (msg.includes("Email not confirmed")) return "Confirme ton email avant de te connecter";
  if (msg.includes("already registered")) return "Cet email est déjà utilisé";
  if (msg.includes("Password should be")) return "Le mot de passe doit faire au moins 6 caractères";
  if (msg.includes("valid email")) return "Adresse email invalide";
  return msg;
}
