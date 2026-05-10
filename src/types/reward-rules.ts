/**
 * Reward rule types (catalog + `public.reward_rules`) aligned with
 * `docs/card-reward-rules-seeding.md`. Business logic (exact + fallback) lives
 * in `src/services/recommendation/`, not here.
 *
 * PostgREST often returns numeric columns as strings; callers coerce at boundaries.
 */

export const REWARD_MODES = ["points", "cashback"] as const;
export type RewardMode = (typeof REWARD_MODES)[number];

/**
 * Row from `public.reward_rules` as returned by Supabase / API.
 * `priority` and `is_fallback` are optional in responses until the DB is migrated
 * and all selects include the new columns.
 */
export type RewardRuleRow = {
  id: string;
  card_id: string;
  /** Prefer narrowing to `RewardMode` in application code. */
  reward_mode: RewardMode | string;
  /** Internal or user-facing category key, depending on selection layer. */
  category: string;
  multiplier: string | null;
  cash_percent: string | null;
  points_currency: string | null;
  notes: string | null;
  /** Lower = more specific; seeding guide uses 10, 20, etc. */
  priority?: string | null;
  /** When true, this is the card's default earn for unmatched categories. */
  is_fallback?: boolean | null;
};

/**
 * Authoring shape for SQL / seed data (per seeding doc). Not a 1:1 DB row
 * (uses `card_name` + `issuer` instead of `card_id`).
 */
export type RewardRuleSeed = {
  card_name: string;
  issuer: string;
  reward_mode: RewardMode;
  category: string;
  multiplier?: number;
  cash_percent?: number;
  points_currency?: string;
  notes?: string;
  priority?: number;
  is_fallback?: boolean;
};
