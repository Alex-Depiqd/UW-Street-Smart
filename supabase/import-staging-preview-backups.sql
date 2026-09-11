-- Run in Supabase → StreetSmart PRODUCTION → SQL Editor
-- AFTER production-preview-backups.sql and AFTER copying the JSON from Staging.
--
-- Replace the [] between $preview$ ... $preview$ with the json_agg result.
-- Either of these paste shapes is fine:
--   [ {email, payload, ...}, ... ]
--   [ { "coalesce": [ {email, payload, ...}, ... ] } ]

with raw as (
  select $preview$[]$preview$::jsonb as j
),
items as (
  select case
    when jsonb_typeof(j) = 'array'
     and jsonb_typeof(j -> 0) = 'object'
     and (j -> 0 ? 'coalesce')
      then j -> 0 -> 'coalesce'
    else j
  end as arr
  from raw
)
insert into public.preview_user_backups (email, payload, source_updated_at, source_user_id)
select
  lower(row_data ->> 'email'),
  row_data -> 'payload',
  nullif(row_data ->> 'source_updated_at', '')::timestamptz,
  nullif(row_data ->> 'source_user_id', '')::uuid
from items,
  jsonb_array_elements(items.arr) as row_data
on conflict (email) do update
  set
    payload = excluded.payload,
    source_updated_at = excluded.source_updated_at,
    source_user_id = excluded.source_user_id
returning
  email,
  source_updated_at,
  coalesce(jsonb_array_length(payload -> 'campaigns'), 0) as campaigns;
