import type { SupabaseClient } from "@supabase/supabase-js";
import type { CardRow } from "@/types/cards";

function normalizeCatalogSearch(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  const t = raw.trim();
  if (t.length === 0) return null;
  const safe = t.replace(/[^a-zA-Z0-9\s\-]/g, "").slice(0, 80);
  return safe.length > 0 ? safe : null;
}

export async function listActiveCatalog(
  supabase: SupabaseClient,
  search?: string | null,
): Promise<{ cards: CardRow[]; error: string | null }> {
  const term = normalizeCatalogSearch(search ?? undefined);
  let q = supabase.from("cards").select("*").eq("is_active", true);

  if (term) {
    q = q.ilike("name", `%${term}%`);
  }

  const { data, error } = await q
    .order("issuer", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { cards: [], error: error.message };
  }

  return { cards: (data ?? []) as CardRow[], error: null };
}
