import { Lesson } from '../types';
import { supabase, supabaseEnabled } from '../lib/supabase';

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

// Upserts every row the client currently has (by user_id+lesson_id), then removes
// only the cloud rows that are no longer present locally. This is deliberately NOT
// delete-then-insert: if the upsert fails partway through, nothing that was already
// in the cloud is lost — the stale-row cleanup only runs after a successful upsert.
async function syncTable(table: 'lessons' | 'lesson_templates', userId: string, items: Lesson[]) {
  if (items.length) {
    const { error } = await supabase!.from(table).upsert(
      items.map((lesson) => ({
        user_id: userId,
        lesson_id: lesson.id,
        payload: lesson,
        updated_at: new Date().toISOString()
      })),
      { onConflict: 'user_id,lesson_id' }
    );
    if (error) return { ok: false, reason: error.message };
  }

  // Clean up rows for lessons that were deleted locally. Scoped to this user +
  // the exact ids no longer present, never a blanket delete of the whole table.
  const keepIds = items.map((l) => l.id);
  let deleteQuery = supabase!.from(table).delete().eq('user_id', userId);
  deleteQuery = keepIds.length ? deleteQuery.not('lesson_id', 'in', `(${keepIds.map((id) => `"${id}"`).join(',')})`) : deleteQuery;
  const { error: deleteError } = await deleteQuery;
  if (deleteError) return { ok: false, reason: deleteError.message };

  return { ok: true };
}

export async function pushCloudLessons(lessons: Lesson[], templates: Lesson[]) {
  if (!supabaseEnabled || !supabase) return { ok: false, reason: 'disabled' };
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, reason: 'no-user' };

  const lessonsResult = await syncTable('lessons', userId, lessons);
  if (!lessonsResult.ok) return lessonsResult;

  const templatesResult = await syncTable('lesson_templates', userId, templates);
  if (!templatesResult.ok) return templatesResult;

  return { ok: true };
}

// Short, URL-safe random id - avoids embedding the whole lesson in the URL
// (which made links too long for WhatsApp/short-link services to handle).
function generateShortId(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < length; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// Stores a shared lesson server-side and returns a short id for the URL.
// Falls back to null when Supabase isn't configured so callers can fall back
// to the old (long) base64-in-URL method instead.
export async function createSharedLesson(lesson: Lesson): Promise<string | null> {
  if (!supabaseEnabled || !supabase) return null;
  const id = generateShortId();
  const { error } = await supabase.from('shared_lessons').insert({ id, payload: lesson });
  if (error) {
    console.warn('createSharedLesson failed', error.message);
    return null;
  }
  return id;
}

// Reads a shared lesson by its short id. Publicly readable by design (RLS
// allows anonymous select) so a recipient who isn't logged in can still see it.
export async function fetchSharedLesson(id: string): Promise<Lesson | null> {
  if (!supabaseEnabled || !supabase) return null;
  const { data, error } = await supabase.from('shared_lessons').select('payload').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data.payload as Lesson;
}

export const supabaseSqlGuide = `
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
`;
