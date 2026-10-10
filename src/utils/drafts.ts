import type { Lesson, LessonExercise } from '../types';
import { parseLesson } from './lessonValidation.ts';
import { draftKey } from './workspace.ts';

export type LessonDraft = { lessonName: string; description: string; level: Lesson['level']; targetFocus: string; exercises: LessonExercise[]; autoBuildDuration: number };
export function readDraft(scope: string, lessonId?: string): { draft: LessonDraft | null; error: boolean } {
  try {
    const raw = localStorage.getItem(draftKey(scope, lessonId));
    if (!raw) return { draft: null, error: false };
    const value = JSON.parse(raw) as LessonDraft;
    const lesson = parseLesson({ id: lessonId || 'draft', name: value.lessonName, description: value.description, level: value.level,
      levelLabel: '', targetFocus: value.targetFocus, exercises: value.exercises, createdAt: '' });
    if (!Number.isInteger(value.autoBuildDuration) || value.autoBuildDuration < 10 || value.autoBuildDuration > 120) throw new Error('משך אינו תקין');
    return { draft: { lessonName: lesson.name, description: lesson.description, level: lesson.level, targetFocus: lesson.targetFocus,
      exercises: lesson.exercises, autoBuildDuration: value.autoBuildDuration }, error: false };
  } catch { return { draft: null, error: true }; }
}
export function writeDraft(scope: string, lessonId: string | undefined, draft: LessonDraft) {
  localStorage.setItem(draftKey(scope, lessonId), JSON.stringify(draft));
}
export function removeDraft(scope: string, lessonId?: string) { localStorage.removeItem(draftKey(scope, lessonId)); }
