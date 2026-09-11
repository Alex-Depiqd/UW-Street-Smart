-- StreetSmart PRODUCTION → SQL Editor.
-- Cloud table for signed-in users. Run once. Includes table grants
-- (RLS policies alone are not enough — without GRANT the app gets
-- "permission denied for table user_app_state").

create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_state enable row level security;
grant select, insert, update on table public.user_app_state to authenticated;

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
