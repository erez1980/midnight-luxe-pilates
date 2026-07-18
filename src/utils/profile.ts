import { supabase, supabaseEnabled } from '../lib/supabase';
import type { AuthProfile } from './auth';

// Persists the signed-in user's details to a `profiles` table so the app has a
// real user record — not just a transient session. Called on every sign-in, so
// last_seen_at doubles as a lightweight "active users" signal and name/avatar
// stay current if the person changes them in their Google account.
//
// Best-effort by design: a failure here must never block sign-in, so it warns
// and returns instead of throwing.
export async function upsertProfile(profile: AuthProfile): Promise<void> {
  if (!supabaseEnabled || !supabase) return;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: profile.id,
      email: profile.email ?? null,
      full_name: profile.name ?? null,
      avatar_url: profile.avatarUrl ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.warn('upsertProfile failed', error.message);
  }
}

export const profilesSqlGuide = `
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A person can only read and write their own profile row.
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
`;
