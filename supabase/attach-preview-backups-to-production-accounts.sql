-- StreetSmart PRODUCTION → SQL Editor.
-- Sign out of getstreetsmart.app first, then run this, then sign back in.

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

insert into public.user_app_state (user_id, payload, updated_at)
select
  u.id,
  b.payload,
  coalesce(b.source_updated_at, now())
from auth.users u
join public.preview_user_backups b
  on lower(b.email) = lower(u.email)
on conflict (user_id) do update
  set
    payload = excluded.payload,
    updated_at = now()
  where coalesce(jsonb_array_length(public.user_app_state.payload -> 'campaigns'), 0) = 0;

-- Expect alex.uw@icloud.com with 3 campaigns
select
  u.email,
  coalesce(jsonb_array_length(s.payload -> 'campaigns'), 0) as campaigns
from public.user_app_state s
join auth.users u on u.id = s.user_id
order by u.email;
