import { readFileSync } from "fs";
import { join } from "path";
import StoryLevelClient from "./StoryLevelClient";

function loadLevels() {
  const filePath = join(process.cwd(), "data", "story", "levels.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryLevelPage({ params }: PageProps) {
  const { id } = await params;
  const levels = loadLevels();
  const level = levels.find((l: { id: number }) => l.id === parseInt(id));

  if (!level) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 text-lg">Niveau introuvable.</p>
      </div>
    );
  }

  return <StoryLevelClient level={level} />;
}
