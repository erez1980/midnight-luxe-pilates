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

// Business/contact details collected once via the in-app profile-setup form —
// the pieces Google login does NOT provide but customer management needs.
export type BusinessType = 'exempt' | 'licensed' | 'company';

export type ProfileDetails = {
  phone: string;
  studioName: string;
  businessType: BusinessType | '';
  businessId: string;
  marketingOptIn: boolean;
  onboardingCompletedAt: string | null;
};

export async function fetchProfileDetails(userId: string): Promise<ProfileDetails | null> {
  if (!supabaseEnabled || !supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('phone, studio_name, business_type, business_id, marketing_opt_in, onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn('fetchProfileDetails failed', error.message);
    return null;
  }

  return {
    phone: data.phone ?? '',
    studioName: data.studio_name ?? '',
    businessType: (data.business_type as BusinessType) ?? '',
    businessId: data.business_id ?? '',
    marketingOptIn: Boolean(data.marketing_opt_in),
    onboardingCompletedAt: data.onboarding_completed_at ?? null,
  };
}

export async function saveProfileDetails(
  userId: string,
  details: Omit<ProfileDetails, 'onboardingCompletedAt'>
): Promise<{ ok: boolean }> {
  if (!supabaseEnabled || !supabase) return { ok: false };

  const { error } = await supabase
    .from('profiles')
    .update({
      phone: details.phone.trim() || null,
      studio_name: details.studioName.trim() || null,
      business_type: details.businessType || null,
      business_id: details.businessId.trim() || null,
      marketing_opt_in: details.marketingOptIn,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.warn('saveProfileDetails failed', error.message);
    return { ok: false };
  }
  return { ok: true };
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
