import {
  PURCHASE_CATEGORIES,
  type PurchaseCategoryId,
} from "@/constants/categories";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/lib/api/require-user";
import {
  removeUserCard,
  updateUserCardCustomCashTopCategory,
} from "@/services/cards/wallet";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const patchBodySchema = z.object({
  customCashTopCategory: z
    .union([z.enum(PURCHASE_CATEGORIES), z.null()])
    .optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const rawParams = await context.params;
  const parsedParams = paramsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return jsonError(400, "validation_error", "Invalid wallet row id");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Expected JSON body");
  }

  const parsedBody = patchBodySchema.safeParse(body);
  if (!parsedBody.success || parsedBody.data.customCashTopCategory === undefined) {
    return jsonError(
      400,
      "validation_error",
      'Body must include customCashTopCategory: purchase slug or null',
    );
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  const cat =
    parsedBody.data.customCashTopCategory === null
      ? null
      : (parsedBody.data.customCashTopCategory as PurchaseCategoryId);

  const result = await updateUserCardCustomCashTopCategory(
    auth.supabase,
    auth.user.id,
    parsedParams.data.id,
    cat,
  );

  if (!result.ok) {
    const status = result.message.includes("not found") ? 404 : 400;
    return jsonError(status, "update_failed", result.message);
  }

  return jsonOk({ updated: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const raw = await context.params;
  const parsedParams = paramsSchema.safeParse(raw);
  if (!parsedParams.success) {
    return jsonError(400, "validation_error", "Invalid wallet row id");
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  const result = await removeUserCard(
    auth.supabase,
    auth.user.id,
    parsedParams.data.id,
  );

  if (!result.ok) {
    const status = result.message.includes("not found") ? 404 : 400;
    return jsonError(status, "delete_failed", result.message);
  }

  return jsonOk({ removed: true });
}
