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
