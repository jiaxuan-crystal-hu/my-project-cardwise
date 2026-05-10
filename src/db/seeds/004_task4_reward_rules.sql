-- Task 4/5: catalog cards + reward rules. Apply after 001_init + 002_reward_rules_*.sql.
-- Source of truth: src/data/catalog/task4-*.ts (regenerate: npx tsx scripts/emit-task4-reward-sql.ts)
-- Re-run: ON CONFLICT (id) DO NOTHING on both tables.

insert into public.cards (id, name, issuer, network, card_type, annual_fee)
values
  ('c4a00000-0000-4000-8000-0000000c0001', 'Chase Sapphire Preferred', 'Chase', 'Visa', 'credit', 95),
  ('c4a00000-0000-4000-8000-0000000c0002', 'Chase Sapphire Reserve', 'Chase', 'Visa', 'credit', 550),
  ('c4a00000-0000-4000-8000-0000000c0003', 'World of Hyatt Credit Card', 'Chase', 'Visa', 'credit', 95),
  ('c4a00000-0000-4000-8000-0000000c0004', 'The Platinum Card', 'American Express', 'Amex', 'credit', 695),
  ('c4a00000-0000-4000-8000-0000000c0005', 'American Express Gold Card', 'American Express', 'Amex', 'credit', 325),
  ('c4a00000-0000-4000-8000-0000000c0006', 'Blue Cash Everyday Card', 'American Express', 'Amex', 'credit', 0),
  ('c4a00000-0000-4000-8000-0000000c0007', 'Blue Cash Preferred Card', 'American Express', 'Amex', 'credit', 95),
  ('c4a00000-0000-4000-8000-0000000c0008', 'Citi Double Cash Card', 'Citi', 'Mastercard', 'credit', 0),
  ('c4a00000-0000-4000-8000-0000000c0009', 'Citi Custom Cash Card', 'Citi', 'Mastercard', 'credit', 0),
  ('c4a00000-0000-4000-8000-0000000c000a', 'Citi / AAdvantage Platinum Select', 'Citi', 'Mastercard', 'credit', 99),
  ('c4a00000-0000-4000-8000-0000000c000b', 'Marriott Bonvoy Boundless', 'Chase', 'Visa', 'credit', 95),
  ('c4a00000-0000-4000-8000-0000000c000c', 'Marriott Bonvoy Bold', 'Chase', 'Visa', 'credit', 0)
on conflict (id) do nothing;

insert into public.reward_rules (id, card_id, reward_mode, category, multiplier, cash_percent, points_currency, notes, priority, is_fallback)
values
  ('a1000000-0000-4000-8000-000000000001', 'c4a00000-0000-4000-8000-0000000c0001', 'points', 'chase_travel', 5, null, 'UR', 'Travel purchased through Chase Travel. Excludes hotel purchases that qualify for the annual Chase Travel hotel credit.', 10, false),
  ('a1000000-0000-4000-8000-000000000002', 'c4a00000-0000-4000-8000-0000000c0001', 'points', 'travel_other', 2, null, 'UR', 'Other travel purchases outside Chase Travel.', 20, false),
  ('a1000000-0000-4000-8000-000000000003', 'c4a00000-0000-4000-8000-0000000c0001', 'points', 'dining', 3, null, 'UR', 'Includes delivery, takeout, and dining out.', 20, false),
  ('a1000000-0000-4000-8000-000000000004', 'c4a00000-0000-4000-8000-0000000c0001', 'points', 'online_grocery', 3, null, 'UR', 'Online grocery purchases. Excludes Target, Walmart, and wholesale clubs.', 20, false),
  ('a1000000-0000-4000-8000-000000000005', 'c4a00000-0000-4000-8000-0000000c0001', 'points', 'streaming', 3, null, 'UR', 'Select streaming services.', 20, false),
  ('a1000000-0000-4000-8000-000000000006', 'c4a00000-0000-4000-8000-0000000c0001', 'points', 'other', 1, null, 'UR', 'Fallback default earn rate for all unmatched purchases.', 100, true),
  ('a1000000-0000-4000-8000-000000000007', 'c4a00000-0000-4000-8000-0000000c0002', 'points', 'chase_travel', 8, null, 'UR', 'All purchases through Chase Travel, including The Edit.', 10, false),
  ('a1000000-0000-4000-8000-000000000008', 'c4a00000-0000-4000-8000-0000000c0002', 'points', 'flight_direct', 4, null, 'UR', 'Flights booked direct.', 20, false),
  ('a1000000-0000-4000-8000-000000000009', 'c4a00000-0000-4000-8000-0000000c0002', 'points', 'hotel_direct', 4, null, 'UR', 'Hotels booked direct.', 20, false),
  ('a1000000-0000-4000-8000-00000000000a', 'c4a00000-0000-4000-8000-0000000c0002', 'points', 'dining', 3, null, 'UR', 'Dining worldwide.', 20, false),
  ('a1000000-0000-4000-8000-00000000000b', 'c4a00000-0000-4000-8000-0000000c0002', 'points', 'other', 1, null, 'UR', 'Fallback default earn rate for all unmatched purchases.', 100, true),
  ('a1000000-0000-4000-8000-00000000000c', 'c4a00000-0000-4000-8000-0000000c0003', 'points', 'hotel_direct', 4, null, 'Hyatt', 'Card earn rate at Hyatt hotels and resorts only. Do not include member-status stack in card rule.', 10, false),
  ('a1000000-0000-4000-8000-00000000000d', 'c4a00000-0000-4000-8000-0000000c0003', 'points', 'dining', 2, null, 'Hyatt', 'Dining category.', 20, false),
  ('a1000000-0000-4000-8000-00000000000e', 'c4a00000-0000-4000-8000-0000000c0003', 'points', 'flight_direct', 2, null, 'Hyatt', 'Airfare purchased directly from the airline.', 20, false),
  ('a1000000-0000-4000-8000-00000000000f', 'c4a00000-0000-4000-8000-0000000c0003', 'points', 'travel_other', 2, null, 'Hyatt', 'Local transit and commuting.', 20, false),
  ('a1000000-0000-4000-8000-000000000010', 'c4a00000-0000-4000-8000-0000000c0003', 'points', 'other', 1, null, 'Hyatt', 'Fallback default earn rate. Gym/fitness 2x exists on the card but is not modeled cleanly in current MVP categories.', 100, true),
  ('a1000000-0000-4000-8000-000000000011', 'c4a00000-0000-4000-8000-0000000c0004', 'points', 'flight_direct', 5, null, 'MR', 'Flights booked directly with airlines or through Amex Travel.', 10, false),
  ('a1000000-0000-4000-8000-000000000012', 'c4a00000-0000-4000-8000-0000000c0004', 'points', 'hotel_direct', 5, null, 'MR', 'Prepaid hotels booked through Amex Travel. Current MVP uses hotel_direct as the closest mapped category.', 20, false),
  ('a1000000-0000-4000-8000-000000000013', 'c4a00000-0000-4000-8000-0000000c0004', 'points', 'other', 1, null, 'MR', 'Fallback default earn rate for all unmatched purchases.', 100, true),
  ('a1000000-0000-4000-8000-000000000014', 'c4a00000-0000-4000-8000-0000000c0005', 'points', 'dining', 4, null, 'MR', 'Restaurants worldwide. Current issuer cap applies, but cap logic is not modeled in MVP.', 10, false),
  ('a1000000-0000-4000-8000-000000000015', 'c4a00000-0000-4000-8000-0000000c0005', 'points', 'online_grocery', 4, null, 'MR', 'U.S. supermarkets. Current MVP uses online_grocery as the groceries bucket even though issuer rule is broader.', 20, false),
  ('a1000000-0000-4000-8000-000000000016', 'c4a00000-0000-4000-8000-0000000c0005', 'points', 'flight_direct', 3, null, 'MR', 'Flights booked directly with airlines or through Amex Travel.', 20, false),
  ('a1000000-0000-4000-8000-000000000017', 'c4a00000-0000-4000-8000-0000000c0005', 'points', 'other', 1, null, 'MR', 'Fallback default earn rate for all unmatched purchases.', 100, true),
  ('a1000000-0000-4000-8000-000000000018', 'c4a00000-0000-4000-8000-0000000c0006', 'cashback', 'online_grocery', null, 3, null, 'U.S. supermarkets. Current MVP uses online_grocery as the groceries bucket.', 10, false),
  ('a1000000-0000-4000-8000-000000000019', 'c4a00000-0000-4000-8000-0000000c0006', 'cashback', 'other', null, 3, null, 'U.S. online retail purchases. Current MVP does not have a dedicated internal online_shopping category.', 20, false),
  ('a1000000-0000-4000-8000-00000000001a', 'c4a00000-0000-4000-8000-0000000c0006', 'cashback', 'other', null, 1, null, 'Fallback default earn rate. Gas 3% exists on the card but is not modeled cleanly in current MVP categories.', 100, true),
  ('a1000000-0000-4000-8000-00000000001b', 'c4a00000-0000-4000-8000-0000000c0007', 'cashback', 'online_grocery', null, 6, null, 'U.S. supermarkets. Current issuer cap exists but is not modeled in MVP.', 10, false),
  ('a1000000-0000-4000-8000-00000000001c', 'c4a00000-0000-4000-8000-0000000c0007', 'cashback', 'streaming', null, 6, null, 'Select U.S. streaming subscriptions.', 20, false),
  ('a1000000-0000-4000-8000-00000000001d', 'c4a00000-0000-4000-8000-0000000c0007', 'cashback', 'other', null, 1, null, 'Fallback default earn rate. Gas 3% and transit 3% exist on the card but are not modeled cleanly in current MVP categories.', 100, true),
  ('a1000000-0000-4000-8000-00000000001e', 'c4a00000-0000-4000-8000-0000000c0008', 'cashback', 'other', null, 2, null, 'Unlimited 2% cash back total: 1% when you buy and 1% as you pay. Acts as a flat-rate fallback across all categories.', 100, true),
  ('a1000000-0000-4000-8000-000000000020', 'c4a00000-0000-4000-8000-0000000c0009', 'cashback', 'other', null, 1, null, 'Default earn rate unless the member sets their Custom Cash top category in the wallet and it matches this purchase category (in-app MVP; up to 5% on top eligible category each billing cycle up to first $500 per issuer rules — caps/cycles not modeled).', 100, true),
  ('a1000000-0000-4000-8000-000000000021', 'c4a00000-0000-4000-8000-0000000c000a', 'points', 'flight_direct', 2, null, 'AA', 'Eligible American Airlines purchases.', 10, false),
  ('a1000000-0000-4000-8000-000000000022', 'c4a00000-0000-4000-8000-0000000c000a', 'points', 'dining', 2, null, 'AA', 'Restaurants, including takeout.', 20, false),
  ('a1000000-0000-4000-8000-000000000023', 'c4a00000-0000-4000-8000-0000000c000a', 'points', 'other', 1, null, 'AA', 'Fallback default earn rate. Gas 2x exists on the card but is not modeled cleanly in current MVP categories.', 100, true),
  ('a1000000-0000-4000-8000-000000000024', 'c4a00000-0000-4000-8000-0000000c000b', 'points', 'hotel_direct', 6, null, 'Marriott', 'Card earn rate at participating Marriott Bonvoy hotels only. Do not include Marriott member/status stack.', 10, false),
  ('a1000000-0000-4000-8000-000000000025', 'c4a00000-0000-4000-8000-0000000c000b', 'points', 'dining', 3, null, 'Marriott', 'Part of combined dining/grocery/gas 3x bucket on up to the current annual cap.', 20, false),
  ('a1000000-0000-4000-8000-000000000026', 'c4a00000-0000-4000-8000-0000000c000b', 'points', 'online_grocery', 3, null, 'Marriott', 'Current MVP uses online_grocery as groceries bucket. Issuer cap exists.', 20, false),
  ('a1000000-0000-4000-8000-000000000027', 'c4a00000-0000-4000-8000-0000000c000b', 'points', 'other', 2, null, 'Marriott', 'Fallback default earn rate. Gas 3x exists on the card but is not modeled cleanly in current MVP categories.', 100, true),
  ('a1000000-0000-4000-8000-000000000028', 'c4a00000-0000-4000-8000-0000000c000c', 'points', 'online_grocery', 2, null, 'Marriott', 'Grocery stores.', 10, false),
  ('a1000000-0000-4000-8000-000000000029', 'c4a00000-0000-4000-8000-0000000c000c', 'points', 'streaming', 2, null, 'Marriott', 'Select streaming services. Internet, cable, and phone services are not modeled separately in MVP.', 20, false),
  ('a1000000-0000-4000-8000-00000000002a', 'c4a00000-0000-4000-8000-0000000c000c', 'points', 'other', 1, null, 'Marriott', 'Fallback default earn rate. Rideshare and select food delivery 2x exist on the card but are not modeled cleanly in current MVP categories.', 100, true)
on conflict (id) do nothing