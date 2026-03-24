import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://aicgrsdchvqeixsdbsyr.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ??
  "sb_publishable_jVZCpAd9ACaT-tAtNHjcrw__FQEMsaI";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  SUPABASE_URL and SUPABASE_KEY are required.");
  process.exit(1);
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface QuestionInput {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const jsonPath = resolve(process.argv[2] ?? "./scripts/questions.json");

  console.log(`📂  Reading questions from: ${jsonPath}`);
  const raw = readFileSync(jsonPath, "utf-8");
  const questions: QuestionInput[] = JSON.parse(raw);
  console.log(`📋  Loaded ${questions.length} questions`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Upsert in batches of 25 to avoid payload limits
  const BATCH = 25;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);

    const { data, error } = await supabase
      .from("questions")
      .upsert(batch, { onConflict: "question" })
      .select("id");

    if (error) {
      console.error(`❌  Batch ${i / BATCH + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length ?? 0;
      console.log(
        `✅  Batch ${i / BATCH + 1}: ${data?.length ?? 0} rows upserted`
      );
    }
  }

  console.log("\n─────────────────────────────────────");
  console.log(`✔  Inserted/updated : ${inserted}`);
  if (errors > 0) console.log(`✘  Failed           : ${errors}`);
  console.log("─────────────────────────────────────");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
