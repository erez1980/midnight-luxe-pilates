import { supabase, supabaseEnabled } from '../lib/supabase';

export type Plan = 'free' | 'pro' | 'studio';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export type Subscription = {
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
};

export const FREE_SUBSCRIPTION: Subscription = {
  plan: 'free',
  status: 'active',
  currentPeriodEnd: null,
  trialEndsAt: null,
};

// What each plan unlocks. Phase 1 keeps every plan fully open so billing
// readiness is invisible to users — turning on real gating later is a matter
// of changing the numbers here, not rewiring the app.
export type Entitlements = {
  maxSavedLessons: number;
  cloudSync: boolean;
  sharing: boolean;
  coachMode: boolean;
};

const OPEN_ENTITLEMENTS: Entitlements = {
  maxSavedLessons: Infinity,
  cloudSync: true,
  sharing: true,
  coachMode: true,
};

export function entitlementsFor(_plan: Plan): Entitlements {
  return OPEN_ENTITLEMENTS;
}

// Enrolls a signed-in user on the free plan if they don't have a subscription
// row yet. Insert-only (ignoreDuplicates) on purpose: RLS allows users to
// self-insert only plan='free', and there is no user update policy — so an
// existing (possibly paid, server-written) row is never touched from the client.
export async function ensureSubscription(userId: string): Promise<void> {
  if (!supabaseEnabled || !supabase) return;

  const { error } = await supabase.from('subscriptions').upsert(
    { user_id: userId, plan: 'free', status: 'active' },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );

  if (error) {
    console.warn('ensureSubscription failed', error.message);
  }
}

export async function fetchSubscription(userId: string): Promise<Subscription> {
  if (!supabaseEnabled || !supabase) return FREE_SUBSCRIPTION;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, trial_ends_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn('fetchSubscription failed', error.message);
    return FREE_SUBSCRIPTION;
  }

  return {
    plan: (data.plan as Plan) || 'free',
    status: (data.status as SubscriptionStatus) || 'active',
    currentPeriodEnd: data.current_period_end ?? null,
    trialEndsAt: data.trial_ends_at ?? null,
  };
}
