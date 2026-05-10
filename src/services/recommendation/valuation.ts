/**
 * Static cents-per-point assumptions for **scoring only** (Task 7).
 * Not redemption advice; easy to tune. Keys are uppercase (`normalizePointsCurrency`).
 *
 * Seeded currencies today: UR, MR, TY, Hyatt, Marriott, AA (see `task4-reward-seeds.ts`).
 */
const CENTS_PER_POINT: Readonly<Record<string, number>> = {
  UR: 0.018,
  MR: 0.017,
  TY: 0.015,
  /** World of Hyatt–style hotel points (rough mid-range CPP). */
  HYATT: 0.0185,
  /** Marriott Bonvoy (typically lower CPP than flexible bank points). */
  MARRIOTT: 0.0075,
  /** American Airlines AAdvantage miles. */
  AA: 0.013,
  CASHBACK: 0.01,
};

/** Default when `points_currency` is absent from the table (still scoring-only). */
const DEFAULT_CENTS_PER_POINT = 0.01;

export function normalizePointsCurrency(currency: string): string {
  return currency.trim().toUpperCase();
}

export function getCentsPerPoint(pointsCurrency: string): number {
  const key = normalizePointsCurrency(pointsCurrency);
  return CENTS_PER_POINT[key] ?? DEFAULT_CENTS_PER_POINT;
}

export function estimatedPointDollarValue(
  points: number,
  pointsCurrency: string,
): number {
  if (!Number.isFinite(points)) {
    return 0;
  }
  return points * getCentsPerPoint(pointsCurrency);
}

export function estimatedCashbackValue(
  purchaseAmount: number,
  cashPercent: number,
): number {
  if (!Number.isFinite(purchaseAmount) || !Number.isFinite(cashPercent)) {
    return 0;
  }
  return purchaseAmount * (cashPercent / 100);
}
