import { jsonError, jsonOk } from "@/lib/api/response";
import { requireUser } from "@/lib/api/require-user";
import { listActiveCatalog } from "@/services/cards/catalog";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const { cards, error } = await listActiveCatalog(auth.supabase, q);

  if (error) {
    return jsonError(500, "catalog_error", error);
  }

  return jsonOk({ cards });
}
