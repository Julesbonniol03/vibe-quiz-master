import { NextRequest, NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

interface RawQuestion {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface Question {
  id: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Load all questions once at module init
let allQuestions: Question[] | null = null;

function loadQuestions(): Question[] {
  if (allQuestions) return allQuestions;

  const dataDir = join(process.cwd(), "data", "questions");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const seen = new Set<string>();
  const questions: Question[] = [];
  let id = 1;

  for (const file of files) {
    const raw = readFileSync(join(dataDir, file), "utf-8");
    const parsed: RawQuestion[] = JSON.parse(raw);
    for (const q of parsed) {
      const key = q.question.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        questions.push({
          id: id++,
          category: q.category,
          difficulty: q.difficulty,
          question: q.question,
          options: q.options,
          correctIndex: q.correct_index,
          explanation: q.explanation,
        });
      }
    }
  }

  allQuestions = questions;
  return questions;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "10", 10) || 10, 1),
    50
  );

  const questions = loadQuestions();

  // Filter
  let filtered = questions;
  if (category && category !== "All") {
    filtered = filtered.filter((q) => q.category === category);
  }
  if (difficulty) {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  if (filtered.length === 0) {
    return NextResponse.json(
      { error: "No questions found for these filters" },
      { status: 404 }
    );
  }

  // Fisher-Yates shuffle
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, limit);

  return NextResponse.json({
    questions: selected,
    total: filtered.length,
    returned: selected.length,
    categories: Array.from(new Set(questions.map((q) => q.category))).sort(),
  });
}
