import { Lesson } from '../types';

const LESSONS_KEY = 'pilates_lessons';
const TEMPLATES_KEY = 'pilates_saved_templates';

export function readLessons(): Lesson[] {
  try {
    return JSON.parse(localStorage.getItem(LESSONS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function writeLessons(lessons: Lesson[]) {
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
}

export function readTemplates(): Lesson[] {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function writeTemplates(templates: Lesson[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function exportLessonsBundle(lessons: Lesson[], templates: Lesson[]) {
  const blob = new Blob([
    JSON.stringify({ exportedAt: new Date().toISOString(), lessons, templates }, null, 2)
  ], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `midnight-luxe-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importLessonsBundle(file: File): Promise<{ lessons: Lesson[]; templates: Lesson[] }> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('קובץ הגיבוי לא בפורמט תקין');
  }

  const lessons = Array.isArray(parsed.lessons) ? parsed.lessons : [];
  const templates = Array.isArray(parsed.templates) ? parsed.templates : [];

  return {
    lessons,
    templates
  };
}

export function buildShareUrl(lesson: Lesson) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(lesson))));
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('sharedLesson', encoded);
  return url.toString();
}

// Short link that just carries an id - the actual lesson data lives server-side
// (see createSharedLesson/fetchSharedLesson in cloudSync.ts). This is the link
// that actually works in WhatsApp and other places with URL length limits.
export function buildShortShareUrl(id: string) {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('s', id);
  return url.toString();
}

export function readSharedLessonFromUrl(): Lesson | null {
  const url = new URL(window.location.href);
  const payload = url.searchParams.get('sharedLesson');
  if (!payload) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return null;
  }
}
