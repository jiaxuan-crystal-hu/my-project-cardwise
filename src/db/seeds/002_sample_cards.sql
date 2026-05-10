-- Sample catalog rows for local development.
-- Run in Supabase SQL editor after `001_init.sql` (requires elevated role that bypasses RLS
-- or temporarily disable RLS — default dashboard SQL editor runs with sufficient privileges).

insert into public.cards (id, name, issuer, network, card_type, annual_fee)
values
  ('11111111-1111-4111-8111-111111111101', 'Blue Cash Preferred', 'American Express', 'Amex', 'credit', 95),
  ('22222222-2222-4222-8222-222222222202', 'Amex Gold', 'American Express', 'Amex', 'credit', 325),
  ('33333333-3333-4333-8333-333333333303', 'Chase Sapphire Preferred', 'Chase', 'Visa', 'credit', 95)
on conflict (id) do nothing;

insert into public.reward_rules (card_id, reward_mode, category, multiplier, cash_percent, points_currency, notes)
values
  (
    '11111111-1111-4111-8111-111111111101',
    'cashback',
    'groceries',
    null,
    6.0,
    null,
    'Illustrative MVP rule'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    'points',
    'dining',
    4.0,
    null,
    'MR',
    '4x Membership Rewards on dining (illustrative)'
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    'points',
    'dining',
    3.0,
    null,
    'UR',
    '3x Ultimate Rewards on dining (illustrative)'
  );

-- Optional: transfer partner examples for future preference boosts
insert into public.transfer_partners (points_currency, partner_name, transfer_ratio)
values
  ('UR', 'Hyatt', 1.0),
  ('MR', 'United', 1.0);
