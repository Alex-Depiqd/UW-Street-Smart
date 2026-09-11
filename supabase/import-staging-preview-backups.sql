-- Run in Supabase → StreetSmart PRODUCTION → SQL Editor
-- AFTER production-preview-backups.sql and AFTER copying the JSON from Staging.
--
-- Replace the [] between $preview$ ... $preview$ with the json_agg result from
-- supabase/export-staging-preview-backups.sql (the whole array, including [ ]).

insert into public.preview_user_backups (email, payload, source_updated_at, source_user_id)
select
  lower(row_data ->> 'email'),
  row_data -> 'payload',
  nullif(row_data ->> 'source_updated_at', '')::timestamptz,
  nullif(row_data ->> 'source_user_id', '')::uuid
from jsonb_array_elements($preview$[]$preview$::jsonb) as row_data
on conflict (email) do update
  set
    payload = excluded.payload,
    source_updated_at = excluded.source_updated_at,
    source_user_id = excluded.source_user_id;
