import { TASK4_CATALOG_CARDS } from "./task4-card-seeds";
import type { Task4RewardRuleSeed } from "./task4-reward-seeds";
import { TASK4_REWARD_RULE_SEEDS } from "./task4-reward-seeds";

/**
 * Mirrors `pickFallbackRow` intent for seeded rows: `is_fallback` and/or
 * `category === "other"` supplies default earn.
 */
function hasFallbackStyleRule(rules: Task4RewardRuleSeed[]): boolean {
  if (rules.some((r) => r.isFallback)) return true;
  return rules.some((r) => r.category === "other");
}

export type Task4SeedVerifyResult = {
  ok: boolean;
  lines: string[];
};

/**
 * In-memory checks on Task 4/5 TypeScript seeds (no DB).
 * - Every catalog card has ≥1 reward rule.
 * - Every catalog card has a fallback-style row (see `hasFallbackStyleRule`).
 * - Every rule references a known catalog `card_id`.
 * - Warn on orphan `card_id` in rules (should not happen).
 */
export function verifyTask4Seeds(): Task4SeedVerifyResult {
  const lines: string[] = [];
  const catalogIds = new Set(TASK4_CATALOG_CARDS.map((c) => c.id));
  const byCard = new Map<string, Task4RewardRuleSeed[]>();

  for (const r of TASK4_REWARD_RULE_SEEDS) {
    const list = byCard.get(r.cardId) ?? [];
    list.push(r);
    byCard.set(r.cardId, list);
  }

  let ok = true;

  for (const card of TASK4_CATALOG_CARDS) {
    const rules = byCard.get(card.id) ?? [];
    if (rules.length === 0) {
      ok = false;
      lines.push(`FAIL  ${card.name} (${card.id}): no reward rules`);
      continue;
    }
    if (!hasFallbackStyleRule(rules)) {
      ok = false;
      lines.push(
        `FAIL  ${card.name} (${card.id}): no fallback row (need is_fallback or category "other")`,
      );
      continue;
    }
    lines.push(
      `OK    ${card.name}: ${rules.length} rule(s), fallback-style row present`,
    );
  }

  for (const [cardId, rules] of byCard) {
    if (!catalogIds.has(cardId)) {
      ok = false;
      lines.push(
        `FAIL  orphan rules: card_id ${cardId} not in Task 4 catalog (${rules.length} row(s))`,
      );
    }
  }

  lines.unshift(
    `Task 4/5 seed verify — ${TASK4_CATALOG_CARDS.length} cards, ${TASK4_REWARD_RULE_SEEDS.length} rules`,
  );
  lines.push(ok ? "\nAll checks passed." : "\nOne or more checks failed.");

  return { ok, lines };
}
