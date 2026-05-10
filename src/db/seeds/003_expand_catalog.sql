-- Expanded catalog: additional cards + reward_rules so every `PURCHASE_CATEGORIES` value
-- (see `src/constants/categories.ts`) has at least one seeded rule in the database.
-- Run in Supabase SQL editor after `001_init.sql` and `002_sample_cards.sql`.
-- Re-run safe: fixed UUIDs + ON CONFLICT DO NOTHING. Does not delete or modify prior rows.

insert into public.cards (id, name, issuer, network, card_type, annual_fee)
values
  (
    '44444444-4444-4444-8444-444444444404',
    'Chase Sapphire Reserve',
    'Chase',
    'Visa',
    'credit',
    550
  ),
  (
    '55555555-5555-4555-a555-555555555505',
    'Citi Custom Cash',
    'Citi',
    'Mastercard',
    'credit',
    0
  ),
  (
    '66666666-6666-4666-a666-666666666606',
    'Capital One Savor',
    'Capital One',
    'Visa',
    'credit',
    95
  ),
  (
    '77777777-7777-4777-a777-777777777707',
    'Citi Double Cash',
    'Citi',
    'Mastercard',
    'credit',
    0
  ),
  (
    '88888888-8888-4888-a888-888888888808',
    'Bank of America Travel Rewards',
    'Bank of America',
    'Visa',
    'credit',
    0
  )
on conflict (id) do nothing;

-- Fixed rule IDs so re-running this script does not duplicate rows.
insert into public.reward_rules (
  id,
  card_id,
  reward_mode,
  category,
  multiplier,
  cash_percent,
  points_currency,
  notes
)
values
  (
    'd0000000-0000-4000-8000-000000000001',
    '44444444-4444-4444-8444-444444444404',
    'points',
    'travel',
    3.0,
    null,
    'UR',
    'Illustrative: 3× Ultimate Rewards on travel (Chase)'
  ),
  (
    'd0000000-0000-4000-8000-000000000002',
    '55555555-5555-4555-a555-555555555505',
    'cashback',
    'gas',
    null,
    5.0,
    null,
    'Illustrative: 5% cashback on a top category including gas (Citi; MVP seed)'
  ),
  (
    'd0000000-0000-4000-8000-000000000003',
    '66666666-6666-4666-a666-666666666606',
    'cashback',
    'dining',
    null,
    4.0,
    null,
    'Illustrative: 4% dining cashback (Capital One Savor)'
  ),
  (
    'd0000000-0000-4000-8000-000000000004',
    '66666666-6666-4666-a666-666666666606',
    'cashback',
    'entertainment',
    null,
    4.0,
    null,
    'Illustrative: 4% entertainment cashback (Capital One Savor)'
  ),
  (
    'd0000000-0000-4000-8000-000000000005',
    '77777777-7777-4777-a777-777777777707',
    'cashback',
    'other',
    null,
    2.0,
    null,
    'Illustrative: 2% on general spend — mapped to "other" for MVP (Citi DC)'
  ),
  (
    'd0000000-0000-4000-8000-000000000006',
    '88888888-8888-4888-a888-888888888808',
    'cashback',
    'travel',
    null,
    1.5,
    null,
    'Illustrative: 1.5% travel cashback (BofA Travel Rewards — seed)'
  )
on conflict (id) do nothing;
