-- CardWise MVP schema + RLS (Supabase / PostgreSQL)
-- Apply via Supabase SQL editor (postgres) or `supabase db push` when using CLI.
-- Requires: auth.users (Supabase built-in).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Public profile row keyed by Supabase Auth user id
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalog + rules (seeded data; no end-user inserts in MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  network text,
  card_type text not null,
  annual_fee integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_rules (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  reward_mode text not null,
  category text not null,
  multiplier numeric(8, 2),
  cash_percent numeric(8, 2),
  points_currency text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.transfer_partners (
  id uuid primary key default gen_random_uuid(),
  points_currency text not null,
  partner_name text not null,
  transfer_ratio numeric(8, 2) not null default 1.0,
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  merchant text,
  category text,
  offer_type text not null,
  value_text text not null,
  value_numeric numeric(10, 2),
  min_spend numeric(10, 2),
  expires_at timestamptz,
  source_type text not null default 'manual',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  nickname text,
  created_at timestamptz not null default now(),
  unique (user_id, card_id)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.users (id) on delete cascade,
  prefers_cashback boolean not null default false,
  prefers_points boolean not null default true,
  travel_goal text,
  preferred_airline text,
  preferred_hotel text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  purchase_category text not null,
  purchase_amount numeric(10, 2),
  recommended_cashback_card_id uuid references public.cards (id),
  recommended_points_card_id uuid references public.cards (id),
  selected_card_id uuid references public.cards (id),
  estimated_cash_saved numeric(10, 2),
  estimated_points_gained numeric(10, 2),
  created_at timestamptz not null default now()
);

create index if not exists idx_reward_rules_card_category
  on public.reward_rules (card_id, category);
create index if not exists idx_user_cards_user_id on public.user_cards (user_id);
create index if not exists idx_offers_card_active on public.offers (card_id, is_active);
create index if not exists idx_recommendation_history_user_id
  on public.recommendation_history (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.cards enable row level security;
alter table public.reward_rules enable row level security;
alter table public.transfer_partners enable row level security;
alter table public.offers enable row level security;
alter table public.user_cards enable row level security;
alter table public.user_preferences enable row level security;
alter table public.recommendation_history enable row level security;

create policy "users_select_own"
  on public.users for select to authenticated
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "cards_select_authenticated"
  on public.cards for select to authenticated
  using (true);

create policy "reward_rules_select_authenticated"
  on public.reward_rules for select to authenticated
  using (true);

create policy "transfer_partners_select_authenticated"
  on public.transfer_partners for select to authenticated
  using (true);

create policy "offers_select_authenticated"
  on public.offers for select to authenticated
  using (is_active = true);

create policy "user_cards_all_own"
  on public.user_cards for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_preferences_all_own"
  on public.user_preferences for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "recommendation_history_all_own"
  on public.recommendation_history for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
