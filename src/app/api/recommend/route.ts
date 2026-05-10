import {
  parseRecommendPostBody,
  recommendApiContract,
} from "@/lib/api/recommend-post";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/lib/api/require-user";
import { recommendForUser } from "@/services/recommendation/engine";

/** Discovery: request/response contract (no auth). */
export async function GET() {
  return jsonOk(recommendApiContract());
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

  const parsed = parseRecommendPostBody(body);
  if (!parsed.ok) {
    return jsonError(400, "validation_error", parsed.message);
  }

  const out = await recommendForUser(auth.supabase, auth.user.id, {
    category: parsed.data.category,
    amount: parsed.data.amount,
  });

  if (!out.ok) {
    const status =
      out.code === "no_cards" || out.code === "invalid_category" ? 400 : 500;
    return jsonError(status, out.code, out.message);
  }

  return jsonOk({
    result: out.result,
    amountUsed: out.amountUsed,
    category: out.category,
  });
}
