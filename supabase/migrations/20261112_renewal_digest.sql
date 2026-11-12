-- Weekly email to Rotem listing clients whose health declaration has expired
-- or expires within 30 days (valid for a year). Sent by the `renewal-digest`
-- Edge Function, called by pg_cron every Sunday at 05:00 UTC (07:00 Israel
-- winter time, 08:00 summer time).
--
-- The function is public (verify_jwt = false) but harmless: it only ever
-- emails Rotem, and this log makes it send at most once every 6 days.

create table if not exists public.renewal_digest_log (
  id bigint generated always as identity primary key,
  sent_at timestamptz not null default now(),
  client_count integer not null
);
alter table public.renewal_digest_log enable row level security;
-- No policies: only the service role (the Edge Function) reads and writes.

create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.schedule(
  'renewal-digest-weekly',
  '0 5 * * 0',
  $$ select net.http_post(
       url := 'https://eghmitxenxwnoygcrefo.supabase.co/functions/v1/renewal-digest',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb
     ) $$
);
