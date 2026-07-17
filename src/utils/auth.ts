import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase, supabaseEnabled } from '../lib/supabase';

export type AuthProfile = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export function toAuthProfile(user: User | null): AuthProfile | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || undefined,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Pilates Instructor',
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
