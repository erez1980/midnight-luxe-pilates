-- Run once in the project's Supabase SQL editor, after taking a backup.
-- Existing links retain access until their new 30-day expiry. Ownership cannot
-- be inferred for old rows, so only new links have owner-driven revocation.
begin;

alter table public.shared_lessons
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists expires_at timestamptz not null default (now() + interval '30 days');
alter table public.shared_lessons enable row level security;

-- Remove old permissive policies, including differently named ones, to avoid
-- accidentally retaining anonymous table-wide reads through an OR policy.
do $$
declare policy_record record;
begin
  for policy_record in select policyname from pg_policies where schemaname = 'public' and tablename = 'shared_lessons'
  loop
    execute format('drop policy %I on public.shared_lessons', policy_record.policyname);
  end loop;
end $$;

revoke all on public.shared_lessons from anon;
revoke all on public.shared_lessons from authenticated;
grant select, insert, delete on public.shared_lessons to authenticated;

create policy shared_lessons_owner_select on public.shared_lessons
  for select to authenticated using (auth.uid() = user_id);
create policy shared_lessons_owner_insert on public.shared_lessons
  for insert to authenticated with check (
    auth.uid() = user_id
    and id ~ '^[a-f0-9]{48}$'
    and expires_at > now()
    and expires_at <= now() + interval '31 days'
    and octet_length(payload::text) <= 250000
  );
create policy shared_lessons_owner_delete on public.shared_lessons
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.get_shared_lesson(share_token text)
returns jsonb language sql security definer stable
set search_path = ''
as $$
  select payload from public.shared_lessons
  where id = share_token
    and expires_at > now()
    and share_token ~ '^[a-zA-Z0-9]{8,64}$'
  limit 1;
$$;
revoke all on function public.get_shared_lesson(text) from public;
grant execute on function public.get_shared_lesson(text) to anon, authenticated;
create index if not exists shared_lessons_expiry_idx on public.shared_lessons (expires_at);
create index if not exists shared_lessons_owner_idx on public.shared_lessons (user_id);
commit;

-- Verification, using an anonymous client (not the SQL editor's admin role):
-- 1. SELECT directly from shared_lessons must fail / return no public data.
-- 2. rpc('get_shared_lesson', {share_token: known_id}) returns one live lesson.
-- 3. An unknown, expired or deleted token returns null.
-- 4. Account B cannot select or delete a row owned by account A.
