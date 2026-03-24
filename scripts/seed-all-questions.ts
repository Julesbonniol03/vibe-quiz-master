import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";
import { ProxyAgent, setGlobalDispatcher } from "undici";

// Route all outgoing requests through the egress proxy (required in this environment)
const proxyUrl = process.env.https_proxy ?? process.env.HTTPS_PROXY ?? "";
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

// ─── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://aicgrsdchvqeixsdbsyr.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ?? "sb_publishable_jVZCpAd9ACaT-tAtNHjcrw__FQEMsaI";

interface QuestionInput {
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

async function main() {
  const dataDir = resolve(__dirname, "../data/questions");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));

  console.log(`\n📂  Loading questions from ${files.length} files...\n`);

  // ─── Load & deduplicate ───────────────────────────────────────────────
  const seen = new Set<string>();
  const allQuestions: QuestionInput[] = [];
  let duplicates = 0;

  for (const file of files.sort()) {
    const raw = readFileSync(join(dataDir, file), "utf-8");
    const questions: QuestionInput[] = JSON.parse(raw);

    let fileCount = 0;
    for (const q of questions) {
      const key = q.question.trim().toLowerCase();
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);

      // Validate structure
      if (
        !q.category ||
        !q.difficulty ||
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correct_index !== "number" ||
        q.correct_index < 0 ||
        q.correct_index > 3 ||
        !q.explanation
      ) {
        console.warn(`⚠️  Skipping invalid question in ${file}: "${q.question?.slice(0, 50)}..."`);
        continue;
      }

      allQuestions.push(q);
      fileCount++;
    }
    console.log(`  ✅ ${file}: ${fileCount} questions loaded`);
  }

  console.log(`\n📊  Total unique questions: ${allQuestions.length}`);
  if (duplicates > 0) console.log(`🔄  Duplicates removed: ${duplicates}`);

  // ─── Upsert to Supabase ───────────────────────────────────────────────
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const BATCH = 25;
  let inserted = 0;
  let errors = 0;

  console.log(`\n🚀  Upserting to Supabase in batches of ${BATCH}...\n`);

  for (let i = 0; i < allQuestions.length; i += BATCH) {
    const batch = allQuestions.slice(i, i + BATCH);

    const { data, error } = await supabase
      .from("questions")
      .upsert(batch, { onConflict: "question" })
      .select("id");

    if (error) {
      console.error(`❌  Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length ?? 0;
      process.stdout.write(
        `\r  ⏳ Progress: ${inserted}/${allQuestions.length} questions upserted`
      );
    }
  }

  // ─── Verify count in DB ───────────────────────────────────────────────
  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  console.log(`\n\n─────────────────────────────────────`);
  console.log(`✔  Upserted     : ${inserted}`);
  if (errors > 0) console.log(`✘  Failed       : ${errors}`);
  console.log(`📦  Total in DB  : ${count}`);
  console.log(`─────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
