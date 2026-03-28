import { readFileSync } from "fs";
import { join } from "path";
import AdventureMap from "./AdventureMap";

function loadAdventureLevels() {
  const filePath = join(process.cwd(), "data", "adventure.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export const metadata = {
  title: "Aventure — Teubé Quiz",
  description: "30 niveaux d'histoire racontés comme un débrief en terrasse. De la Préhistoire à l'Ère Numérique.",
};

export default function AventurePage() {
  const levels = loadAdventureLevels();
  return <AdventureMap levels={levels} />;
}
