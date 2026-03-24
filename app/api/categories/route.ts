import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

interface RawQuestion {
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function GET() {
  const dataDir = join(process.cwd(), "data", "questions");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));

  const categoryMap: Record<string, number> = {};

  for (const file of files) {
    const raw = readFileSync(join(dataDir, file), "utf-8");
    const parsed: RawQuestion[] = JSON.parse(raw);
    for (const q of parsed) {
      categoryMap[q.category] = (categoryMap[q.category] || 0) + 1;
    }
  }

  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    categories,
    total: Object.values(categoryMap).reduce((a, b) => a + b, 0),
  });
}
