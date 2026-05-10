/**
 * Task 4 card catalog (source of truth for names + metadata until SQL is updated).
 * See `docs/task-list-card-reward-rules.md` — do not add cards not listed there.
 * Annual fees: illustrative for MVP, rounded USD.
 */

import type { CardRow } from "@/types/cards";

/** Authoring shape; maps to `public.cards` (minus `created_at` / DB defaults). */
export type CatalogCardSeed = Pick<
  CardRow,
  "id" | "name" | "issuer" | "network" | "card_type" | "annual_fee" | "is_active"
> & {
  /**
   * Stable key for code and Task 5 reward rules (`RewardRuleSeed` joins by
   * `card_name` + `issuer` or by importing these ids into SQL).
   */
  slug: string;
};

/**
 * Fixed UUIDs (v4 layout) for merge-safe Supabase seeding. Last segment
 * increments: …01 …0c = 12 cards.
 */
export const CATALOG_SLUGS = {
  chaseSapphirePreferred: "c4a00000-0000-4000-8000-0000000c0001",
  chaseSapphireReserve: "c4a00000-0000-4000-8000-0000000c0002",
  worldOfHyatt: "c4a00000-0000-4000-8000-0000000c0003",
  amexPlatinum: "c4a00000-0000-4000-8000-0000000c0004",
  amexGold: "c4a00000-0000-4000-8000-0000000c0005",
  amexBlueCashEveryday: "c4a00000-0000-4000-8000-0000000c0006",
  amexBlueCashPreferred: "c4a00000-0000-4000-8000-0000000c0007",
  citiDoubleCash: "c4a00000-0000-4000-8000-0000000c0008",
  citiCustomCash: "c4a00000-0000-4000-8000-0000000c0009",
  citiAAdvantagePlatinumSelect: "c4a00000-0000-4000-8000-0000000c000a",
  marriottBonvoyBoundless: "c4a00000-0000-4000-8000-0000000c000b",
  marriottBonvoyBold: "c4a00000-0000-4000-8000-0000000c000c",
} as const;

export type Task4CardSlug = keyof typeof CATALOG_SLUGS;

export const TASK4_CATALOG_CARDS: readonly CatalogCardSeed[] = [
  {
    slug: "chaseSapphirePreferred",
    id: CATALOG_SLUGS.chaseSapphirePreferred,
    name: "Chase Sapphire Preferred",
    issuer: "Chase",
    network: "Visa",
    card_type: "credit",
    annual_fee: 95,
    is_active: true,
  },
  {
    slug: "chaseSapphireReserve",
    id: CATALOG_SLUGS.chaseSapphireReserve,
    name: "Chase Sapphire Reserve",
    issuer: "Chase",
    network: "Visa",
    card_type: "credit",
    annual_fee: 550,
    is_active: true,
  },
  {
    slug: "worldOfHyatt",
    id: CATALOG_SLUGS.worldOfHyatt,
    name: "World of Hyatt Credit Card",
    issuer: "Chase",
    network: "Visa",
    card_type: "credit",
    annual_fee: 95,
    is_active: true,
  },
  {
    slug: "amexPlatinum",
    id: CATALOG_SLUGS.amexPlatinum,
    name: "The Platinum Card",
    issuer: "American Express",
    network: "Amex",
    card_type: "credit",
    annual_fee: 695,
    is_active: true,
  },
  {
    slug: "amexGold",
    id: CATALOG_SLUGS.amexGold,
    name: "American Express Gold Card",
    issuer: "American Express",
    network: "Amex",
    card_type: "credit",
    annual_fee: 325,
    is_active: true,
  },
  {
    slug: "amexBlueCashEveryday",
    id: CATALOG_SLUGS.amexBlueCashEveryday,
    name: "Blue Cash Everyday Card",
    issuer: "American Express",
    network: "Amex",
    card_type: "credit",
    annual_fee: 0,
    is_active: true,
  },
  {
    slug: "amexBlueCashPreferred",
    id: CATALOG_SLUGS.amexBlueCashPreferred,
    name: "Blue Cash Preferred Card",
    issuer: "American Express",
    network: "Amex",
    card_type: "credit",
    annual_fee: 95,
    is_active: true,
  },
  {
    slug: "citiDoubleCash",
    id: CATALOG_SLUGS.citiDoubleCash,
    name: "Citi Double Cash Card",
    issuer: "Citi",
    network: "Mastercard",
    card_type: "credit",
    annual_fee: 0,
    is_active: true,
  },
  {
    slug: "citiCustomCash",
    id: CATALOG_SLUGS.citiCustomCash,
    name: "Citi Custom Cash Card",
    issuer: "Citi",
    network: "Mastercard",
    card_type: "credit",
    annual_fee: 0,
    is_active: true,
  },
  {
    slug: "citiAAdvantagePlatinumSelect",
    id: CATALOG_SLUGS.citiAAdvantagePlatinumSelect,
    name: "Citi / AAdvantage Platinum Select",
    issuer: "Citi",
    network: "Mastercard",
    card_type: "credit",
    annual_fee: 99,
    is_active: true,
  },
  {
    slug: "marriottBonvoyBoundless",
    id: CATALOG_SLUGS.marriottBonvoyBoundless,
    name: "Marriott Bonvoy Boundless",
    issuer: "Chase",
    network: "Visa",
    card_type: "credit",
    annual_fee: 95,
    is_active: true,
  },
  {
    slug: "marriottBonvoyBold",
    id: CATALOG_SLUGS.marriottBonvoyBold,
    name: "Marriott Bonvoy Bold",
    issuer: "Chase",
    network: "Visa",
    card_type: "credit",
    annual_fee: 0,
    is_active: true,
  },
] as const;

const byId = new Map(
  TASK4_CATALOG_CARDS.map((c) => [c.id, c] as const),
) as ReadonlyMap<string, CatalogCardSeed>;

export function getTask4CatalogCardById(id: string): CatalogCardSeed | undefined {
  return byId.get(id);
}
