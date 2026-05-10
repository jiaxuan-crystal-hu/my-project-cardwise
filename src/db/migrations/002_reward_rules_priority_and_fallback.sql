-- Per docs/card-reward-rules-seeding: exact rules + a single default earn row
-- (is_fallback and/or category = 'other'). Apply in Supabase after 001_init.sql.

alter table public.reward_rules
  add column if not exists priority integer,
  add column if not exists is_fallback boolean not null default false;

comment on column public.reward_rules.priority is
  'Lower = more specific (seeding doc). Nullable for legacy rows.';
comment on column public.reward_rules.is_fallback is
  'True when this row is the card default "everything else" earn rate.';
