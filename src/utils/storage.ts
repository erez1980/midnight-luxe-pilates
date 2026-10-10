import type { Lesson } from '../types';
import { parseLesson, parseLessons } from './lessonValidation';

export function readLegacyBundle(): { lessons: Lesson[]; templates: Lesson[] } {
  return {
    lessons: parseLessons(JSON.parse(localStorage.getItem('pilates_lessons') || '[]')),
    templates: parseLessons(JSON.parse(localStorage.getItem('pilates_saved_templates') || '[]')),
  };
}
export function hasLegacyBundle() {
  return Boolean(localStorage.getItem('pilates_lessons') || localStorage.getItem('pilates_saved_templates'));
}
export function exportRawWorkspace(scope: string) {
  const records: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === `pilates:workspace:v3:${scope}` || key?.startsWith(`pilates:draft:v3:${scope}:`)) records[key] = localStorage.getItem(key) || '';
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify({ rawLocalBackup: records }, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'pilates-local-recovery.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportLessonsBundle(lessons: Lesson[], templates: Lesson[]) {
  const blob = new Blob([JSON.stringify({ version: 3, exportedAt: new Date().toISOString(), lessons, templates }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pilates-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importLessonsBundle(file: File): Promise<{ lessons: Lesson[]; templates: Lesson[] }> {
  if (file.size > 5 * 1024 * 1024) throw new Error('קובץ הגיבוי גדול מדי (עד 5MB)');
  const parsed: unknown = JSON.parse(await file.text());
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('קובץ הגיבוי אינו תקין');
  const bundle = parsed as Record<string, unknown>;
  if (!Array.isArray(bundle.lessons) || !Array.isArray(bundle.templates)) throw new Error('בקובץ חסרות רשימות שיעורים ותבניות');
  return { lessons: parseLessons(bundle.lessons), templates: parseLessons(bundle.templates) };
}
export function buildShareUrl(lesson: Lesson) {
  const bytes = new TextEncoder().encode(JSON.stringify(parseLesson(lesson)));
  const encoded = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('sharedLesson', encoded);
  if (url.toString().length > 8000) throw new Error('השיעור גדול מדי לקישור מקומי. אפשר לייצא גיבוי או להתחבר לשיתוף בקישור קצר.');
  return url.toString();
}
export function buildShortShareUrl(id: string) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('s', id);
  return url.toString();
}
export function readSharedLessonFromUrl(): Lesson | null {
  const payload = new URL(window.location.href).searchParams.get('sharedLesson');
  if (!payload) return null;
  if (payload.length > 250000) throw new Error('קישור השיתוף גדול מדי');
  const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
  return parseLesson(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
}
