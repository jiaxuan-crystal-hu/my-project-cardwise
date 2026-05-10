import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/lib/api/require-user";
import { z } from "zod";

const postSchema = z.object({
  purchaseCategory: z.string().min(1).max(80),
  purchaseAmount: z.number().nonnegative().max(1_000_000).optional().nullable(),
  selectedCardId: z.string().uuid(),
  recommendedCashbackCardId: z.string().uuid().nullable().optional(),
  recommendedPointsCardId: z.string().uuid().nullable().optional(),
  estimatedCashSaved: z.number().optional().nullable(),
  estimatedPointsGained: z.number().optional().nullable(),
});

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  const { data, error } = await auth.supabase
    .from("recommendation_history")
    .select(
      "id, purchase_category, purchase_amount, recommended_cashback_card_id, recommended_points_card_id, selected_card_id, estimated_cash_saved, estimated_points_gained, created_at",
    )
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return jsonError(500, "query_failed", error.message);
  }

  return jsonOk({ history: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Expected JSON body");
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "validation_error", "Invalid recommendation history body");
  }

  const { error } = await auth.supabase.from("recommendation_history").insert({
    user_id: auth.user.id,
    purchase_category: parsed.data.purchaseCategory,
    purchase_amount: parsed.data.purchaseAmount ?? null,
    selected_card_id: parsed.data.selectedCardId,
    recommended_cashback_card_id: parsed.data.recommendedCashbackCardId ?? null,
    recommended_points_card_id: parsed.data.recommendedPointsCardId ?? null,
    estimated_cash_saved: parsed.data.estimatedCashSaved ?? null,
    estimated_points_gained: parsed.data.estimatedPointsGained ?? null,
  });

  if (error) {
    return jsonError(500, "insert_failed", error.message);
  }

  return jsonOk({ saved: true });
}
