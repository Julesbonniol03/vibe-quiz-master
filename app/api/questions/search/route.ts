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
  period?: string;
}

interface Question {
  id: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  period?: string;
}

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
          period: q.period,
        });
      }
    }
  }

  allQuestions = questions;
  return questions;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "30", 10) || 30, 1),
    100
  );
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

  const questions = loadQuestions();
  const categories = Array.from(new Set(questions.map((question) => question.category))).sort();

  let filtered = questions;

  if (q) {
    filtered = filtered.filter(
      (question) =>
        question.question.toLowerCase().includes(q) ||
        question.options.some((opt) => opt.toLowerCase().includes(q)) ||
        question.explanation.toLowerCase().includes(q)
    );
  }

  if (category && category !== "All") {
    filtered = filtered.filter((question) => question.category === category);
  }

  if (difficulty) {
    filtered = filtered.filter((question) => question.difficulty === difficulty);
  }

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);

  return NextResponse.json({ questions: page, total, returned: page.length, offset, categories });
}
