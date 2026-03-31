import { readFileSync } from "fs";
import { join } from "path";
import { Suspense } from "react";
import StoryModeClient from "./StoryModeClient";

const EXPERT_CATEGORIES = [
  { key: "cinema", name: "Cinéma", emoji: "🎬" },
  { key: "histoire", name: "Histoire", emoji: "🏛️" },
  { key: "sciences", name: "Sciences", emoji: "🔬" },
  { key: "geographie", name: "Géographie", emoji: "🌍" },
  { key: "musique", name: "Musique", emoji: "🎵" },
  { key: "sport", name: "Sport", emoji: "⚽" },
  { key: "pop-culture", name: "Pop Culture", emoji: "🎮" },
  { key: "technologie", name: "Technologie", emoji: "💻" },
  { key: "gastronomie", name: "Gastronomie", emoji: "🍕" },
  { key: "nature-animaux", name: "Nature & Animaux", emoji: "🦁" },
  { key: "espace-astronomie", name: "Espace", emoji: "🚀" },
  { key: "philosophie", name: "Philosophie", emoji: "🧠" },
  { key: "mythologie-religions", name: "Mythologie", emoji: "⚡" },
  { key: "economie-business", name: "Économie", emoji: "💰" },
  { key: "arts-litterature", name: "Arts & Littérature", emoji: "🎨" },
  { key: "actualites", name: "Actualités", emoji: "📰" },
  { key: "maitrise-francais", name: "Français", emoji: "📚" },
];

function loadStoryLevels() {
  const filePath = join(process.cwd(), "data", "story-mode.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function loadExpertCategories() {
  return EXPERT_CATEGORIES.map((cat) => {
    const filePath = join(process.cwd(), "data", "questions", `${cat.key}.json`);
    const questions = JSON.parse(readFileSync(filePath, "utf-8"));

    // Load expert story if available
    let story = null;
    try {
      const storyPath = join(process.cwd(), "data", "expert-stories", `${cat.key}.json`);
      story = JSON.parse(readFileSync(storyPath, "utf-8"));
    } catch {
      // No story for this category yet
    }

    return { ...cat, questions, story };
  });
}

export const metadata = {
  title: "Mode Épopée — Teubé",
  description: "L'Odyssée de la Culture G : 30 niveaux de la Préhistoire à l'Ère Numérique, chaque époque racontée comme un débrief en terrasse.",
};

export default function StoryModePage() {
  const levels = loadStoryLevels();
  const expertCategories = loadExpertCategories();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-slate-500 text-sm">Chargement...</div></div>}>
      <StoryModeClient levels={levels} expertCategories={expertCategories} />
    </Suspense>
  );
}
