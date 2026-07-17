import type { User } from '@supabase/supabase-js';
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
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
  };
}

export async function getAuthProfile() {
  if (!supabaseEnabled || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return toAuthProfile(data.user);
}

export async function signInWithGoogle() {
  if (!supabaseEnabled || !supabase) return { ok: false, reason: 'disabled' };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return error ? { ok: false, reason: error.message } : { ok: true };
}

export async function signOut() {
  if (!supabaseEnabled || !supabase) return;
  await supabase.auth.signOut();
}
