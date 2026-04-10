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
    console.log("[Auth] Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      console.warn("[Auth] Profile fetch error:", error.message, error.code);
    }
    if (data) {
      console.log("[Auth] Profile loaded:", data.pseudo, "XP:", data.xp);
      setProfile(data as SupabaseProfile);
    }
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
    console.log("[Auth] Starting signUp for:", email);

    // 1. Sign up with Supabase Auth — pass pseudo/avatar as metadata for the DB trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { pseudo, avatar_id: avatarId },
      },
    });

    if (error) {
      console.error("[Auth] SignUp error:", error.message, error.status);
      return { error: translateAuthError(error.message) };
    }
    if (!data.user) {
      console.error("[Auth] SignUp: no user returned");
      return { error: "Erreur inconnue" };
    }

    console.log("[Auth] User created:", data.user.id, "Session:", !!data.session);

    // 2. Migrate localStorage XP
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
      localXp = JSON.parse(localStorage.getItem("inkult_xp") || "0");
      localGames = JSON.parse(localStorage.getItem("inkult_games") || "0");
      localPlayed = JSON.parse(localStorage.getItem("inkult_played") || "0");
      localCorrect = JSON.parse(localStorage.getItem("inkult_correct") || "0");
      localBestStreak = JSON.parse(localStorage.getItem("inkult_best_streak") || "0");
      localDailyStreak = JSON.parse(localStorage.getItem("inkult_daily_streak") || "0");
      localDailyLastDate = localStorage.getItem("inkult_daily_last_date") || "";
      localDailyCompleted = localStorage.getItem("inkult_daily_completed") || "";
      localCategoryStats = JSON.parse(localStorage.getItem("inkult_category_stats") || "{}");
      localSpeedRecord = JSON.parse(localStorage.getItem("inkult_speed_records") || '{"totalTime":0,"totalAnswered":0,"bestAvg":0}');
    } catch { /* ignore */ }

    console.log("[Auth] Local XP to migrate:", localXp);

    // 3. Create profile row — try insert, if trigger already created it, update instead
    const profileData = {
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
    };

    const { error: insertError } = await supabase.from("profiles").upsert(profileData, { onConflict: "id" });

    if (insertError) {
      console.error("[Auth] Profile upsert error:", insertError.message, insertError.code, insertError.details);
      // Non-blocking: the DB trigger may handle it, or user can retry
      // Still return success if auth worked
    } else {
      console.log("[Auth] Profile upserted successfully");
    }

    // 4. Try to fetch profile (may have been created by DB trigger)
    await fetchProfile(data.user.id);
    return { error: null };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log("[Auth] Starting signIn for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[Auth] SignIn error:", error.message, error.status);
      return { error: translateAuthError(error.message) };
    }
    console.log("[Auth] SignIn success, user:", data.user?.id);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const updateProfileField = useCallback(async (fields: Partial<SupabaseProfile>) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(fields).eq("id", user.id);
    if (error) {
      console.error("[Auth] Profile update error:", error.message);
    }
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
