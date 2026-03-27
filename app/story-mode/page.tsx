import { readFileSync } from "fs";
import { join } from "path";
import StoryModeClient from "./StoryModeClient";

function loadLevels() {
  const filePath = join(process.cwd(), "data", "story", "levels.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export default function StoryModePage() {
  const levels = loadLevels();
  return <StoryModeClient levels={levels} />;
}
