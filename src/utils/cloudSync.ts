import type { Lesson } from '../types';
import { supabase, supabaseEnabled } from '../lib/supabase';
import { parseLesson } from './lessonValidation';
import type { CloudRow, PendingChange } from './workspace';

export class SyncConflict extends Error {}
async function requireUser(expectedUser: string) {
  if (!supabaseEnabled || !supabase) throw new Error('הסנכרון לענן אינו זמין');
  const { data, error } = await supabase.auth.getUser();
  if (error || data.user?.id !== expectedUser) throw new Error('החשבון השתנה. יש להתחבר שוב לפני סנכרון.');
}
export async function pullCloudLessons(userId: string): Promise<CloudRow[]> {
  await requireUser(userId);
  const results = await Promise.all([
    supabase!.from('lessons').select('lesson_id,payload,updated_at').eq('user_id', userId),
    supabase!.from('lesson_templates').select('lesson_id,payload,updated_at').eq('user_id', userId),
  ]);
  const rows: CloudRow[] = [];
  results.forEach((result, index) => {
    if (result.error) throw new Error('טעינת השיעורים מהענן נכשלה. לא נשלחו שינויים.');
    for (const row of result.data || []) {
      const lesson = parseLesson(row.payload);
      if (lesson.id !== row.lesson_id || typeof row.updated_at !== 'string') throw new Error('נתוני הענן אינם תקינים');
      rows.push({ collection: index === 0 ? 'lessons' : 'templates', id: lesson.id, lesson, revision: row.updated_at, deleted: row.payload?._deleted === true });
    }
  });
  return rows;
}
// Compare-and-swap per item. Tombstones use the existing JSONB payload schema;
// no new database columns are needed for safe multi-device synchronization.
export async function pushCloudChange(userId: string, change: PendingChange): Promise<string> {
  await requireUser(userId);
  const table = change.collection === 'lessons' ? 'lessons' : 'lesson_templates';
  const suffix = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000).padStart(3, '0');
  const revision = new Date().toISOString().replace('Z', suffix + 'Z');
  const record = { user_id: userId, lesson_id: change.id, payload: { ...parseLesson(change.lesson), _deleted: change.deleted }, updated_at: revision };
  const result = change.expectedRevision === null
    ? await supabase!.from(table).insert(record).select('updated_at').single()
    : await supabase!.from(table).update({ payload: record.payload, updated_at: revision }).eq('user_id', userId).eq('lesson_id', change.id).eq('updated_at', change.expectedRevision).select('updated_at').maybeSingle();
  if (result.error?.code === '23505' || (!result.error && !result.data)) throw new SyncConflict('השיעור השתנה במכשיר אחר');
  if (result.error) throw new Error('שליחת השינויים לענן נכשלה. השינויים נשמרו במכשיר.');
  return result.data!.updated_at;
}
export async function createSharedLesson(lesson: Lesson): Promise<string | null> {
  if (!supabaseEnabled || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const id = Array.from(crypto.getRandomValues(new Uint8Array(24)), (v) => v.toString(16).padStart(2, '0')).join('');
  const { error } = await supabase.from('shared_lessons').insert({ id, user_id: data.user.id, payload: parseLesson(lesson), expires_at: new Date(Date.now() + 30 * 86400000).toISOString() });
  if (error) throw new Error('יצירת קישור קצר אינה זמינה. אפשר לשתף את טקסט השיעור או לייצא גיבוי.');
  return id;
}
export async function fetchSharedLesson(id: string): Promise<Lesson | null> {
  if (!supabaseEnabled || !supabase) throw new Error('טעינת קישור השיתוף אינה זמינה כרגע');
  if (!/^[a-zA-Z0-9]{8,64}$/.test(id)) return null;
  const { data, error } = await supabase.rpc('get_shared_lesson', { share_token: id });
  if (error) throw new Error('טעינת הקישור נכשלה. אפשר לנסות שוב מאוחר יותר.');
  return data ? parseLesson(data) : null;
}
export async function revokeSharedLessons(lessonId: string) {
  if (!supabase) throw new Error('השיתוף אינו זמין');
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('יש להתחבר לביטול קישורים');
  const { error } = await supabase.from('shared_lessons').delete().eq('user_id', data.user.id).eq('payload->>id', lessonId);
  if (error) throw new Error('ביטול הקישורים נכשל. אפשר לנסות שוב.');
}
