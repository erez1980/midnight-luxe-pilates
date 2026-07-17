import { Lesson } from '../types';
import { supabase, supabaseEnabled } from '../lib/supabase';

export async function signInAnonymously() {
  if (!supabaseEnabled || !supabase) return { ok: false, reason: 'disabled' };
  const { error } = await supabase.auth.signInAnonymously();
  return error ? { ok: false, reason: error.message } : { ok: true };
}

export async function getCurrentUserId() {
  if (!supabaseEnabled || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

export async function pullCloudLessons() {
  if (!supabaseEnabled || !supabase) return { lessons: [], templates: [] };
  const userId = await getCurrentUserId();
  if (!userId) return { lessons: [], templates: [] };

  const [lessonsRes, templatesRes] = await Promise.all([
    supabase.from('lessons').select('payload').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('lesson_templates').select('payload').eq('user_id', userId).order('updated_at', { ascending: false })
  ]);

  return {
    lessons: (lessonsRes.data || []).map((row: any) => row.payload as Lesson),
    templates: (templatesRes.data || []).map((row: any) => row.payload as Lesson)
  };
}

export async function pushCloudLessons(lessons: Lesson[], templates: Lesson[]) {
  if (!supabaseEnabled || !supabase) return { ok: false, reason: 'disabled' };
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: 'no-user' };

  await supabase.from('lessons').delete().eq('user_id', userId);
  await supabase.from('lesson_templates').delete().eq('user_id', userId);

  if (lessons.length) {
    const { error } = await supabase.from('lessons').insert(
      lessons.map((lesson) => ({ user_id: userId, lesson_id: lesson.id, payload: lesson }))
    );
    if (error) return { ok: false, reason: error.message };
  }

  if (templates.length) {
    const { error } = await supabase.from('lesson_templates').insert(
      templates.map((lesson) => ({ user_id: userId, lesson_id: lesson.id, payload: lesson }))
    );
    if (error) return { ok: false, reason: error.message };
  }

  return { ok: true };
}

export const supabaseSqlGuide = `
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

create policy if not exists lessons_own on public.lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists lesson_templates_own on public.lesson_templates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
`;
