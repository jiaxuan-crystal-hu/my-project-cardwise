-- Optional: user-declared Citi Custom Cash 5% bucket (purchase category slug).
-- Recommendations use this only when it matches the current purchase category.
-- Apply after public.user_cards exists (001_init).

alter table public.user_cards
  add column if not exists custom_cash_top_category text null;

comment on column public.user_cards.custom_cash_top_category is
  'MVP: optional purchase slug (see PURCHASE_CATEGORIES) for Citi Custom Cash 5% modeling; null means default to 1% in-app.';
