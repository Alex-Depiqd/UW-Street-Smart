-- Run in Supabase → StreetSmart STAGING → SQL Editor.
--
-- 1) See who has a cloud backup (email, last sync, campaign count):

select
  u.email,
  s.updated_at,
  coalesce(jsonb_array_length(s.payload -> 'campaigns'), 0) as campaigns,
  s.user_id
from public.user_app_state s
join auth.users u on u.id = s.user_id
order by s.updated_at desc;

-- 2) Copy/paste this JSON result into the production insert below.
--    In the SQL editor, run the query, then copy the single json value.

select coalesce(json_agg(json_build_object(
  'email', lower(u.email),
  'payload', s.payload,
  'source_updated_at', s.updated_at,
  'source_user_id', s.user_id
)), '[]'::json)
from public.user_app_state s
join auth.users u on u.id = s.user_id
where u.email is not null
  and coalesce(jsonb_array_length(s.payload -> 'campaigns'), 0) > 0;
