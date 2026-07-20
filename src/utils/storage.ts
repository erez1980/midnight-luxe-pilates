import { Lesson } from '../types';

const LESSONS_KEY = 'pilates_lessons';
const TEMPLATES_KEY = 'pilates_saved_templates';

function normalizeLesson(raw: any): Lesson {
  const exercises = Array.isArray(raw?.exercises) ? raw.exercises : [];
  const totalDuration = typeof raw?.totalDuration === 'number'
    ? raw.totalDuration
    : exercises.reduce((sum: number, item: any) => sum + (Number(item?.customDuration) || 0), 0);

  return {
    id: String(raw?.id || `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    name: String(raw?.name || 'שיעור ללא שם'),
    description: String(raw?.description || ''),
    level: raw?.level || 'mixed',
    levelLabel: String(raw?.levelLabel || 'מותאם אישית'),
    targetFocus: String(raw?.targetFocus || ''),
    exercises,
    totalDuration,
    createdAt: String(raw?.createdAt || new Date().toISOString().split('T')[0]),
    isCustom: Boolean(raw?.isCustom ?? true)
  };
}

export function readLessons(): Lesson[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LESSONS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeLesson) : [];
  } catch {
    return [];
  }
}

export function writeLessons(lessons: Lesson[]) {
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons.map(normalizeLesson)));
}

export function readTemplates(): Lesson[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeLesson) : [];
  } catch {
    return [];
  }
}

export function writeTemplates(templates: Lesson[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates.map(normalizeLesson)));
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
