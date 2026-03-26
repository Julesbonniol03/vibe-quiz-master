"use client";

import { useState, useEffect, useCallback } from "react";

const KEY_PROFILE = "vqm_profile";

export interface UserProfile {
  pseudo: string;
  avatarId: string;
  createdAt: number;
}

function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
  }, []);

  const saveProfile = useCallback((data: UserProfile) => {
    localStorage.setItem(KEY_PROFILE, JSON.stringify(data));
    setProfile(data);
  }, []);

  const createProfile = useCallback((pseudo: string, avatarId: string) => {
    const newProfile: UserProfile = {
      pseudo,
      avatarId,
      createdAt: Date.now(),
    };
    saveProfile(newProfile);
    return newProfile;
  }, [saveProfile]);

  const updatePseudo = useCallback((pseudo: string) => {
    if (!profile) return;
    saveProfile({ ...profile, pseudo });
  }, [profile, saveProfile]);

  const updateAvatar = useCallback((avatarId: string) => {
    if (!profile) return;
    saveProfile({ ...profile, avatarId });
  }, [profile, saveProfile]);

  const hasProfile = hydrated && profile !== null;

  return {
    profile,
    hydrated,
    hasProfile,
    createProfile,
    updatePseudo,
    updateAvatar,
  };
}
