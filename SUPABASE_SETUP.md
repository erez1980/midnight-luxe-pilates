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
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_templates (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  lesson_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.lessons enable row level security;
alter table public.lesson_templates enable row level security;

create policy lessons_own on public.lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy lesson_templates_own on public.lesson_templates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 3. Auth
ב-Supabase Auth להפעיל Anonymous Sign-Ins.

## 4. Deploy
לאחר עדכון env, לבצע build+deploy מחדש.
