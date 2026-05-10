import type { PurchaseCategoryId } from "@/constants/categories";

export type CardRow = {
  id: string;
  name: string;
  issuer: string;
  network: string | null;
  card_type: string;
  annual_fee: number;
  is_active: boolean;
  created_at: string;
};

export type UserCardRow = {
  id: string;
  user_id: string;
  card_id: string;
  nickname: string | null;
  /** MVP: optional slug aligned with `PURCHASE_CATEGORIES` for Citi Custom Cash only. */
  custom_cash_top_category: string | null;
  created_at: string;
};

export type WalletEntry = {
  userCardId: string;
  nickname: string | null;
  card: CardRow;
  /**
   * When set on a Citi Custom Cash wallet row, recommendations may apply 5% if it
   * matches the purchase category; otherwise the app uses 1%.
   */
  customCashTopCategory: PurchaseCategoryId | null;
};
