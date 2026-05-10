import type { TransferPartnerRow } from "@/types/recommendation";
import { normalizePointsCurrency } from "./valuation";

type TravelPrefs = { travel_goal?: string | null } | null;

/**
 * Static 1.1x on estimated **points $ value** when user travel goal lines up with a
 * transfer partner row (Tech Design).
 */
export function getPointsValueBoost(
  prefs: TravelPrefs,
  partners: TransferPartnerRow[],
  pointsCurrency: string,
): { multiplier: number; reason: string | null } {
  const cur = normalizePointsCurrency(pointsCurrency);
  const goal = prefs?.travel_goal?.toLowerCase() ?? "";

  const hasPartner = (name: string) =>
    partners.some(
      (p) =>
        normalizePointsCurrency(p.points_currency) === cur &&
        p.partner_name.toLowerCase() === name.toLowerCase(),
    );

  if (goal === "hotels" && hasPartner("Hyatt")) {
    return { multiplier: 1.1, reason: "Preferred hotels + partner boost (UR → Hyatt)" };
  }
  if (goal === "flights" && hasPartner("United")) {
    return { multiplier: 1.1, reason: "Preferred flights + partner boost (MR → United)" };
  }

  return { multiplier: 1, reason: null };
}
