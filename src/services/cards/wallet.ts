import type { PurchaseCategoryId } from "@/constants/categories";
import { coerceStoredPurchaseCategory } from "@/constants/categories";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CATALOG_SLUGS } from "@/data/catalog/task4-card-seeds";
import type { CardRow, UserCardRow, WalletEntry } from "@/types/cards";

export async function listUserWallet(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ entries: WalletEntry[]; error: string | null }> {
  const { data: rows, error: ucError } = await supabase
    .from("user_cards")
    .select(
      "id, user_id, card_id, nickname, custom_cash_top_category, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (ucError) {
    return { entries: [], error: ucError.message };
  }

  const userCards = (rows ?? []) as UserCardRow[];
  if (userCards.length === 0) {
    return { entries: [], error: null };
  }

  const cardIds = [...new Set(userCards.map((r) => r.card_id))];
  const { data: cardRows, error: cError } = await supabase
    .from("cards")
    .select("*")
    .in("id", cardIds);

  if (cError) {
    return { entries: [], error: cError.message };
  }

  const byId = new Map((cardRows as CardRow[] | null)?.map((c) => [c.id, c]) ?? []);
  const entries: WalletEntry[] = [];

  for (const uc of userCards) {
    const card = byId.get(uc.card_id);
    if (!card) continue;
    const top = coerceStoredPurchaseCategory(uc.custom_cash_top_category);
    entries.push({
      userCardId: uc.id,
      nickname: uc.nickname,
      card,
      customCashTopCategory: top,
    });
  }

  return { entries, error: null };
}

export async function addUserCard(
  supabase: SupabaseClient,
  userId: string,
  cardId: string,
): Promise<{ ok: true } | { ok: false; code: "duplicate" | "unknown"; message: string }> {
  const { error } = await supabase.from("user_cards").insert({
    user_id: userId,
    card_id: cardId,
  });

  if (!error) {
    return { ok: true };
  }

  if (error.code === "23505") {
    return {
      ok: false,
      code: "duplicate",
      message: "That card is already in your wallet.",
    };
  }

  return {
    ok: false,
    code: "unknown",
    message: error.message,
  };
}

export async function updateUserCardCustomCashTopCategory(
  supabase: SupabaseClient,
  userId: string,
  userCardId: string,
  category: PurchaseCategoryId | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: row, error: findErr } = await supabase
    .from("user_cards")
    .select("id, card_id")
    .eq("id", userCardId)
    .eq("user_id", userId)
    .maybeSingle();

  if (findErr) {
    return { ok: false, message: findErr.message };
  }
  if (!row) {
    return { ok: false, message: "Card not found in your wallet." };
  }
  if (row.card_id !== CATALOG_SLUGS.citiCustomCash) {
    return {
      ok: false,
      message: "Custom Cash top category can only be set for Citi Custom Cash.",
    };
  }

  const { error } = await supabase
    .from("user_cards")
    .update({ custom_cash_top_category: category })
    .eq("id", userCardId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function removeUserCard(
  supabase: SupabaseClient,
  userId: string,
  userCardId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: existing, error: findErr } = await supabase
    .from("user_cards")
    .select("id")
    .eq("id", userCardId)
    .eq("user_id", userId)
    .maybeSingle();

  if (findErr) {
    return { ok: false, message: findErr.message };
  }
  if (!existing) {
    return { ok: false, message: "Card not found in your wallet." };
  }

  const { error } = await supabase
    .from("user_cards")
    .delete()
    .eq("id", userCardId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
