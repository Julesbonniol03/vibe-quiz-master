import { readFileSync } from "fs";
import { join } from "path";
import StoryModeClient from "./StoryModeClient";

function loadStoryLevels() {
  const filePath = join(process.cwd(), "data", "story-mode.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export const metadata = {
  title: "Story Mode — Teubé Quiz",
  description: "L'Odyssée de la Culture G : de l'Empire Romain au Moyen-Âge, chaque jour une pépite d'histoire.",
};

export default function StoryModePage() {
  const levels = loadStoryLevels();
  return <StoryModeClient levels={levels} />;
}
