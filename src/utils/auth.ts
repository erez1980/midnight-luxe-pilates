import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase, supabaseEnabled } from '../lib/supabase';

export type AuthProfile = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

// Derives a human display name. Falls back to the email's local part, tidied
// up ("dana.levi" -> "Dana Levi"), rather than showing a raw email address as
// if it were a name.
function displayNameFrom(user: User): string {
  const meta = user.user_metadata || {};
  const fromMeta =
    meta.full_name ||
    meta.name ||
    [meta.given_name, meta.family_name].filter(Boolean).join(' ');
  if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();

  const local = (user.email || '').split('@')[0];
  if (local) {
    return local
      .replace(/[._-]+/g, ' ')
      .replace(/\d+/g, '')
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return 'Pilates Instructor';
}

export function toAuthProfile(user: User | null): AuthProfile | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || undefined,
    name: displayNameFrom(user),
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || user.identities?.[0]?.identity_data?.avatar_url || undefined,
  };
}

export async function getAuthProfile() {
  if (!supabaseEnabled || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return toAuthProfile(data.session?.user ?? null);
}

export function listenToAuthChanges(callback: (profile: AuthProfile | null, event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabaseEnabled || !supabase) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(toAuthProfile(session?.user ?? null), event, session);
  });
  return data.subscription;
}

export async function signInWithGoogle() {
  if (!supabaseEnabled || !supabase) return { ok: false, reason: 'disabled' };
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
  return error ? { ok: false, reason: error.message } : { ok: true };
}

export async function signOut() {
  if (!supabaseEnabled || !supabase) return;
  await supabase.auth.signOut();
}
