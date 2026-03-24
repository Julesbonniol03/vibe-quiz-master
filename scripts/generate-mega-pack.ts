/**
 * generate-mega-pack.ts
 *
 * Uses Claude to generate 50 themed quiz questions, then upserts them into Supabase.
 * Run 10 times to reach 500 unique questions.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... SUPABASE_KEY=<service_role_key> npx tsx scripts/generate-mega-pack.ts
 *   ANTHROPIC_API_KEY=sk-... SUPABASE_KEY=<service_role_key> npx tsx scripts/generate-mega-pack.ts --theme "Cinéma"
 *
 * Tip: run it 10 times in parallel with the helper at the bottom of this file.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { ProxyAgent, setGlobalDispatcher } from "undici";

// Route all outgoing requests through the egress proxy (required in this environment)
const proxyUrl = process.env.https_proxy ?? process.env.HTTPS_PROXY ?? "";
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

// ─── Config ────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://aicgrsdchvqeixsdbsyr.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? "";

if (!ANTHROPIC_API_KEY) {
  console.error("❌  Set ANTHROPIC_API_KEY env variable.");
  process.exit(1);
}
if (!SUPABASE_KEY) {
  console.error("❌  Set SUPABASE_KEY env variable (service role key).");
  process.exit(1);
}

// ─── Themes pool (rotated by run index) ────────────────────────────────────

const ALL_THEMES = [
  "Cinéma",
  "Espace & Astronomie",
  "Histoire de l'Art",
  "Technologie & Informatique",
  "Cuisine du monde",
  "Musique",
  "Géographie",
  "Littérature",
  "Nature & Animaux",
  "Jeux Vidéo",
];

// ─── Types ─────────────────────────────────────────────────────────────────

interface GeneratedQuestion {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

// ─── Claude prompt ─────────────────────────────────────────────────────────

function buildPrompt(theme: string): string {
  return `Tu es un expert en quiz trivia de haute qualité.

Génère exactement 50 questions de quiz sur le thème : **${theme}**.

Règles STRICTES :
- Mélange les niveaux : environ 17 "easy", 17 "medium", 16 "hard"
- Chaque question doit avoir EXACTEMENT 4 options (options[])
- correct_index est l'index 0-basé de la bonne réponse dans options[]
- L'explication doit être fun, instructive et faire ~1-2 phrases
- Les questions doivent être variées, pas de doublons évidents
- Utilise le français pour toutes les questions et explications
- Sois précis et vérifie que correct_index correspond bien à la bonne réponse

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après.
Format exact :
[
  {
    "category": "${theme}",
    "difficulty": "easy" | "medium" | "hard",
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct_index": 0,
    "explanation": "..."
  },
  ...
]`;
}

// ─── Generate questions with Claude ────────────────────────────────────────

async function generateQuestions(
  theme: string
): Promise<GeneratedQuestion[]> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  console.log(`\n🤖  Generating 50 questions for theme: "${theme}" …`);

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: buildPrompt(theme) }],
  });

  const message = await stream.finalMessage();

  // Extract the text content block
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text block in Claude response");
  }

  const raw = textBlock.text.trim();

  // Strip markdown code fences if present
  const jsonStr = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let questions: GeneratedQuestion[];
  try {
    questions = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Raw response (first 500 chars):", raw.slice(0, 500));
    throw new Error(`Failed to parse JSON from Claude: ${e}`);
  }

  if (!Array.isArray(questions)) {
    throw new Error("Claude did not return a JSON array");
  }

  // Basic validation
  const valid = questions.filter((q) => {
    return (
      q.category &&
      q.difficulty &&
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correct_index === "number" &&
      q.correct_index >= 0 &&
      q.correct_index <= 3 &&
      q.explanation
    );
  });

  console.log(
    `✅  Claude returned ${questions.length} questions (${valid.length} valid)`
  );
  return valid;
}

// ─── Upsert into Supabase ──────────────────────────────────────────────────

async function upsertToSupabase(questions: GeneratedQuestion[]): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const BATCH = 20;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);

    const { data, error } = await supabase
      .from("questions")
      .upsert(batch, { onConflict: "question" })
      .select("id");

    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length ?? 0;
      console.log(
        `  ✅ Batch ${Math.floor(i / BATCH) + 1}: ${data?.length ?? 0} rows upserted`
      );
    }
  }

  console.log(`\n📊  Supabase result: ${inserted} inserted/updated, ${errors} failed`);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function runOnce(runIndex: number): Promise<void> {
  const themeArg = process.argv.find((a) => a.startsWith("--theme="))?.split("=")[1];
  const theme = themeArg ?? ALL_THEMES[runIndex % ALL_THEMES.length];

  console.log(`\n${"─".repeat(55)}`);
  console.log(`🎯  Run ${runIndex + 1} — Theme: "${theme}"`);
  console.log("─".repeat(55));

  const questions = await generateQuestions(theme);
  await upsertToSupabase(questions);
}

async function main() {
  const runsArg = process.argv.find((a) => a.startsWith("--runs="))?.split("=")[1];
  const totalRuns = runsArg ? parseInt(runsArg, 10) : 1;

  console.log(`\n🚀  Vibe Quiz Mega-Pack Generator`);
  console.log(`📋  ${totalRuns} run(s) × ~50 questions = ~${totalRuns * 50} questions`);
  console.log(`🗂️   Themes: ${ALL_THEMES.join(", ")}`);

  let totalInserted = 0;
  for (let i = 0; i < totalRuns; i++) {
    await runOnce(i);
    totalInserted += 50;
    if (i < totalRuns - 1) {
      // Small pause between runs to respect rate limits
      console.log("⏳  Waiting 3s before next run…");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\n${"═".repeat(55)}`);
  console.log(`🏆  All done! ~${totalInserted} questions generated across ${totalRuns} themes.`);
  console.log("═".repeat(55));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
