export type { RewardMode, RewardRuleRow, RewardRuleSeed } from "./reward-rules";

/**
 * User/API input to the recommendation flow (valid purchase category is enforced
 * in `recommendForUser` against `PURCHASE_CATEGORIES` until the model expands).
 */
export type RecommendationInput = {
  category: string;
  amount?: number | null;
};

/** Structured response from the recommendation engine and `POST /api/recommend`. */
export type RecommendationOutput = RecommendationResult;

export type CashbackTrack = {
  kind: "cashback";
  cardId: string;
  cardName: string;
  /** Estimated cash back in dollars (not guaranteed). */
  estimatedValue: number;
  explanation: string;
};

export type PointsTrack = {
  kind: "points";
  cardId: string;
  cardName: string;
  estimatedPoints: number;
  /** App-defined $/point; estimate only, not a redemption guarantee. */
  estimatedDollarValue: number;
  explanation: string;
};

export type RecommendationResult = {
  cashback: CashbackTrack | null;
  points: PointsTrack | null;
  warnings: string[];
};

export type UserPreferencesRow = {
  user_id: string;
  prefers_cashback: boolean;
  prefers_points: boolean;
  travel_goal: string | null;
  preferred_airline: string | null;
  preferred_hotel: string | null;
};

export type TransferPartnerRow = {
  points_currency: string;
  partner_name: string;
  transfer_ratio: number;
};
