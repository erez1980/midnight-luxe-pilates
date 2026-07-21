# Supabase Setup

כדי להפעיל cloud sync אמיתי:

## 1. env
העתק מ-`.env.example` ל-`.env` והכנס:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 2. SQL
הרץ ב-Supabase SQL Editor:

```sql
create table if not exists public.lessons (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  lesson_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.lesson_templates (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  lesson_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.shared_lessons (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;
alter table public.lesson_templates enable row level security;
alter table public.shared_lessons enable row level security;

create policy lessons_own on public.lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy lesson_templates_own on public.lesson_templates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shared lessons are readable by anyone with the link (including guests who
-- aren't logged in), but only a signed-in user can create one.
create policy shared_lessons_public_read on public.shared_lessons for select using (true);
create policy shared_lessons_authenticated_insert on public.shared_lessons for insert with check (auth.uid() is not null);
```

**אם כבר הרצת SQL בעבר ואין לך את טבלת `shared_lessons`** (תכונת שיתוף שיעור עם קישור קצר) — הרץ רק את זה:

```sql
create table if not exists public.shared_lessons (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.shared_lessons enable row level security;

create policy shared_lessons_public_read on public.shared_lessons for select using (true);
create policy shared_lessons_authenticated_insert on public.shared_lessons for insert with check (auth.uid() is not null);
```

**אם כבר הרצת את ה-SQL הזה בעבר** (לפני שהיה `unique (user_id, lesson_id)`), הטבלאות שלך חסרות את ה-constraint הזה, וה-sync החדש (שמשתמש ב-`upsert`) לא יעבוד בלעדיו. הרץ בנוסף:

```sql
alter table public.lessons add constraint lessons_user_lesson_unique unique (user_id, lesson_id);
alter table public.lesson_templates add constraint lesson_templates_user_lesson_unique unique (user_id, lesson_id);
```

אם יש כבר שורות כפולות מהתקופה של ה-delete+insert הישן, ה-`alter table` הזה ייכשל עם שגיאת duplicate key — במקרה כזה יש למחוק ידנית שורות כפולות (Table Editor → למיין לפי `lesson_id` → למחוק כפילויות) לפני הרצת ה-constraint.

## 3. Auth
האתר משתמש ב-**Google OAuth** (לא Anonymous Sign-Ins). ב-Supabase Dashboard:

1. Authentication → Providers → הפעל **Google**.
2. ב-[Google Cloud Console](https://console.cloud.google.com/) — צור OAuth Client ID מסוג Web application.
3. הוסף ל-Authorized redirect URIs את כתובת ה-callback שמופיעה בעמוד ה-Google provider ב-Supabase (בפורמט `https://YOUR_PROJECT.supabase.co/auth/v1/callback`).
4. העתק את ה-Client ID וה-Client Secret חזרה לעמוד ה-provider ב-Supabase ושמור.
5. ב-Authentication → URL Configuration, ודא שכתובת האתר שלך (production + `http://localhost:5173` לפיתוח) מופיעה תחת Redirect URLs — אחרת ה-login יחזיר שגיאה אחרי אישור Google.

## 4. Deploy
לאחר עדכון env, לבצע build+deploy מחדש.

## User profiles table

Stores a real user record on sign-in (name, email, avatar, last seen) instead of
relying only on the transient session. Run once in the Supabase SQL Editor:

```sql
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
```

The upsert runs on every sign-in (`src/utils/profile.ts`), so `last_seen_at`
doubles as a lightweight active-user signal and the name/avatar stay current.
It is best-effort — a failure logs a warning and never blocks sign-in.

## Billing readiness — Phase 1 (customer details + subscriptions)

תשתית הנתונים לקראת מודל בתשלום: הרחבת `profiles` בפרטים עסקיים שנאספים
בטופס השלמת פרופיל, טבלת `subscriptions` (כולם נכנסים כ-free), וטבלת
`payments` להיסטוריית חיובים (כתיבה אליה תגיע רק מ-Edge Function בשלב 2).
הרץ פעם אחת ב-SQL Editor:

```sql
-- 1. Extra customer fields collected by the in-app profile-setup form.
alter table public.profiles
  add column if not exists phone text,
  add column if not exists studio_name text,
  add column if not exists business_type text,
  add column if not exists business_id text,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

-- 2. One subscription row per user. The client may only self-enroll as
--    'free' — paid plans will be written exclusively by a service-role
--    Edge Function (bypasses RLS) once a payment provider is connected,
--    so a user cannot upgrade themselves through the public API.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy subscriptions_select_own on public.subscriptions
  for select using (auth.uid() = user_id);
create policy subscriptions_insert_free_own on public.subscriptions
  for insert with check (auth.uid() = user_id and plan = 'free');
-- Deliberately no user update/delete policies: plan changes are server-side only.

-- 3. Payment history. Read-only for users; rows are inserted only by the
--    payment webhook (service role) in Phase 2.
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text,
  amount_agorot integer not null,
  currency text not null default 'ILS',
  status text not null,
  provider text,
  provider_payment_id text,
  invoice_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy payments_select_own on public.payments
  for select using (auth.uid() = user_id);
```

ניהול לקוחות בשלב הזה נעשה ישירות מ-Supabase Dashboard (Table Editor על
`profiles` + `subscriptions`) — אין צורך בממשק אדמין נפרד.
