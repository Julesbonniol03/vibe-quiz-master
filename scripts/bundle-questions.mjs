/**
 * Pre-build script: bundles all questions into a single JSON file
 * for Capacitor static export (no API routes available).
 * Run: node scripts/bundle-questions.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data", "questions");
const outDir = join(__dirname, "..", "public", "data");

const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
const seen = new Set();
const questions = [];
let id = 1;

for (const file of files) {
  const raw = readFileSync(join(dataDir, file), "utf-8");
  const parsed = JSON.parse(raw);
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
        period: q.period || undefined,
      });
    }
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "all-questions.json"), JSON.stringify(questions));

const categories = [...new Set(questions.map((q) => q.category))].sort().map((name) => ({
  name,
  count: questions.filter((q) => q.category === name).length,
}));
writeFileSync(join(outDir, "categories.json"), JSON.stringify({ categories, total: questions.length }));

console.log(`✓ Bundled ${questions.length} questions (${categories.length} categories) → public/data/`);
