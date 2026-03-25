import { NextResponse } from "next/server";
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

let allQuestions: Question[] | null = null;

function loadQuestions(): Question[] {
  if (allQuestions) return allQuestions;

  const dataDir = join(process.cwd(), "data", "questions");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const seen = new Set<string>();
  const questions: Question[] = [];
  let id = 1;

  for (const file of files.sort()) {
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

// Deterministic seed from date string -> pick 5 questions
function seededShuffle(arr: Question[], seed: number): Question[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dateSeed(): { seed: number; dateStr: string } {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  // Simple hash from date string
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed << 5) - seed + dateStr.charCodeAt(i)) & 0x7fffffff;
  }
  return { seed, dateStr };
}

export async function GET() {
  const questions = loadQuestions();
  const { seed, dateStr } = dateSeed();

  // Pick 5 questions spread across different categories
  const shuffled = seededShuffle(questions, seed);
  const selected: Question[] = [];
  const usedCategories = new Set<string>();

  // First pass: one per category
  for (const q of shuffled) {
    if (selected.length >= 5) break;
    if (!usedCategories.has(q.category)) {
      usedCategories.add(q.category);
      selected.push(q);
    }
  }

  // Fill remaining if needed
  for (const q of shuffled) {
    if (selected.length >= 5) break;
    if (!selected.includes(q)) {
      selected.push(q);
    }
  }

  return NextResponse.json({
    questions: selected,
    date: dateStr,
    count: selected.length,
  });
}
