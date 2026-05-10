import {
  PURCHASE_CATEGORIES,
  type PurchaseCategoryId,
} from "@/constants/categories";
import type { RecommendationResult } from "@/types/recommendation";
import { z } from "zod";

/**
 * POST `/api/recommend` — validates JSON before `recommendForUser`.
 *
 * **Request body**
 * - `category` (string): one of `PURCHASE_CATEGORIES` (trimmed, case-insensitive).
 * - `amount` (optional number): positive, max 1e6; omit or `null` to use engine default ($100).
 *
 * **Success** (`{ ok: true, data }` from `jsonOk`)
 * - `data.result` — `RecommendationResult` (`cashback` | `points` tracks + `warnings`).
 * - `data.amountUsed` — dollars used for comparison (default 100 if amount omitted).
 * - `data.category` — normalized purchase slug.
 *
 * **Errors** (`{ ok: false, error: { code, message } }`)
 * - `400` `invalid_json` — body not JSON.
 * - `400` `validation_error` — body failed schema (includes unknown category).
 * - `400` `no_cards` | `invalid_category` — from engine (wallet / category).
 * - `500` `data` — Supabase or unexpected engine failure.
 */
export type RecommendPostResponseData = {
  result: RecommendationResult;
  amountUsed: number;
  category: PurchaseCategoryId;
};

const rawBodySchema = z.object({
  category: z.string().min(1).max(64),
  amount: z.union([z.number().positive().max(1_000_000), z.null()]).optional(),
});

export type ParsedRecommendBody = {
  category: PurchaseCategoryId;
  amount?: number | null;
};

export function parseRecommendPostBody(
  body: unknown,
): { ok: true; data: ParsedRecommendBody } | { ok: false; message: string } {
  const r = rawBodySchema.safeParse(body);
  if (!r.success) {
    const msg = r.error.errors.map((e) => e.message).join("; ");
    return { ok: false, message: msg || "Invalid request body" };
  }
  const cat = r.data.category.trim().toLowerCase();
  if (!(PURCHASE_CATEGORIES as readonly string[]).includes(cat)) {
    return {
      ok: false,
      message: `category must be one of: ${PURCHASE_CATEGORIES.join(", ")}`,
    };
  }
  return {
    ok: true,
    data: {
      category: cat as PurchaseCategoryId,
      amount: r.data.amount,
    },
  };
}

/** Static contract for GET `/api/recommend` (no auth). */
export function recommendApiContract() {
  return {
    post: {
      path: "/api/recommend",
      authentication: "Required (session cookie); same as other dashboard APIs.",
      body: {
        category: PURCHASE_CATEGORIES,
        amount:
          "optional number | null — positive, ≤ 1_000_000; omit for default comparison amount ($100).",
      },
      success: {
        shape: "{ ok: true, data: { result, amountUsed, category } }",
        result:
          "{ cashback: { kind, cardId, cardName, estimatedValue, explanation } | null, points: { kind, cardId, cardName, estimatedPoints, estimatedDollarValue, explanation } | null, warnings: string[] }",
      },
      errors: [
        "invalid_json (400)",
        "validation_error (400)",
        "no_cards (400)",
        "invalid_category (400)",
        "data (500)",
      ],
    },
  } as const;
}
