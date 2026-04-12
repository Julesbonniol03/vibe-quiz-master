'use client';

import { useEffect } from 'react';
import { AdMob } from '@capacitor-community/admob';
import QuizClient from "./QuizClient";

interface Props {
  searchParams: { category?: string; mode?: string };
}

export default function QuizPage({ searchParams }: Props) {
  
  useEffect(() => {
    // Initialise AdMob dès que l'utilisateur arrive sur la page du quiz
    const initAdMob = async () => {
      try {
        await AdMob.initialize();
      } catch (e) {
        console.log("AdMob déjà initialisé ou erreur");
      }
    };
    initAdMob();
  }, []);

  return (
    <QuizClient
      initialCategory={searchParams.category}
      initialMode={(searchParams.mode as "classique" | "blitz" | "mort-subite" | "daily") || undefined}
    />
  );
}
