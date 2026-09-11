-- Run in Supabase → StreetSmart PRODUCTION → SQL Editor after the import.
-- Expect one row per beta tester (email, last staging sync, campaign count).

select
  email,
  source_updated_at,
  coalesce(jsonb_array_length(payload -> 'campaigns'), 0) as campaigns
from public.preview_user_backups
order by source_updated_at desc;
