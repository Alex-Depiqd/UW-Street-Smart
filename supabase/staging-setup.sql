-- Street Smart: cloud backup table (one row per signed-in user).
-- Run once in Supabase → SQL Editor (StreetSmart Staging project).

create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_state enable row level security;

drop policy if exists "Users read own state" on public.user_app_state;
create policy "Users read own state"
  on public.user_app_state for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own state" on public.user_app_state;
create policy "Users insert own state"
  on public.user_app_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own state" on public.user_app_state;
create policy "Users update own state"
  on public.user_app_state for update
  using (auth.uid() = user_id);
