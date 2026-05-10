import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/lib/api/require-user";
import { addUserCard, listUserWallet } from "@/services/cards/wallet";
import { z } from "zod";

const postBodySchema = z.object({
  cardId: z.string().uuid(),
});

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  const { entries, error } = await listUserWallet(auth.supabase, auth.user.id);
  if (error) {
    return jsonError(500, "wallet_error", error);
  }

  return jsonOk({ entries });
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

  const parsed = postBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      "validation_error",
      "Request body must be { \"cardId\": \"<uuid>\" }",
    );
  }

  const result = await addUserCard(
    auth.supabase,
    auth.user.id,
    parsed.data.cardId,
  );

  if (!result.ok) {
    const status = result.code === "duplicate" ? 409 : 400;
    return jsonError(status, result.code, result.message);
  }

  return jsonOk({ added: true });
}
