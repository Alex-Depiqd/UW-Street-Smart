-- Street Smart production: holding table for Staging (deploy-preview) backups.
-- Run once in Supabase → StreetSmart PRODUCTION → SQL Editor.

create table if not exists public.preview_user_backups (
  email text primary key,
  payload jsonb not null,
  source_updated_at timestamptz,
  source_user_id uuid
);

alter table public.preview_user_backups enable row level security;
grant select on table public.preview_user_backups to authenticated;

drop policy if exists "Users read own preview backup" on public.preview_user_backups;
create policy "Users read own preview backup"
  on public.preview_user_backups for select
  using (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or exists (
      select 1
      from auth.users u
      where u.id = auth.uid()
        and lower(u.email) = lower(preview_user_backups.email)
    )
  );
