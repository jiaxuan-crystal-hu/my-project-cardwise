/**
 * One-off: emit `src/db/seeds/004_task4_reward_rules.sql` from TypeScript source.
 * Run: npx tsx scripts/emit-task4-reward-sql.ts
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TASK4_CATALOG_CARDS } from "../src/data/catalog/task4-card-seeds";
import { TASK4_REWARD_RULE_SEEDS } from "../src/data/catalog/task4-reward-seeds";

const __dir = dirname(fileURLToPath(import.meta.url));
const out = join(__dir, "../src/db/seeds/004_task4_reward_rules.sql");

function sqlStr(s: string) {
  return `'${s.replaceAll("'", "''")}'`;
}

function sqlStrOrNull(s: string | null) {
  if (s === null) return "null";
  return sqlStr(s);
}

function numOrNull(s: string | null) {
  if (s === null) return "null";
  const n = Number(s);
  if (!Number.isFinite(n)) return "null";
  return String(n);
}

const cardRows = TASK4_CATALOG_CARDS.map(
  (c) =>
    `  ('${c.id}', ${sqlStr(c.name)}, ${sqlStr(c.issuer)}, ${sqlStr(
      c.network ?? "",
    )}, ${sqlStr(c.card_type)}, ${c.annual_fee})`,
).join(",\n");

const ruleRows = TASK4_REWARD_RULE_SEEDS.map((r) => {
  const mult = numOrNull(r.multiplier);
  const cash = numOrNull(r.cashPercent);
  const pcur = sqlStrOrNull(r.pointsCurrency);
  const pri = parseInt(r.priority, 10);
  const fall = r.isFallback ? "true" : "false";
  return `  ('${r.id}', '${r.cardId}', ${sqlStr(
    r.reward_mode,
  )}, ${sqlStr(r.category)}, ${mult}, ${cash}, ${pcur}, ${sqlStr(
    r.notes ?? "",
  )}, ${isNaN(pri) ? 0 : pri}, ${fall})`;
}).join(",\n");

const sql = `-- Task 4/5: catalog cards + reward rules. Apply after 001_init + 002_reward_rules_* + 003_user_cards_* (column optional for seeds).
-- Source of truth: src/data/catalog/task4-*.ts (regenerate: npx tsx scripts/emit-task4-reward-sql.ts)
-- Re-run: ON CONFLICT (id) DO NOTHING on both tables.

insert into public.cards (id, name, issuer, network, card_type, annual_fee)
values
${cardRows}
on conflict (id) do nothing;

insert into public.reward_rules (id, card_id, reward_mode, category, multiplier, cash_percent, points_currency, notes, priority, is_fallback)
values
${ruleRows}
on conflict (id) do nothing;
`;

writeFileSync(out, sql, "utf8");
// eslint-disable-next-line no-console
console.log("Wrote", out);
