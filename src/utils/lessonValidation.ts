import type { Exercise, Lesson } from '../types';

const levels = ['beginner', 'intermediate', 'advanced', 'mixed'];
const apparatus = ['mat', 'reformer', 'cadillac', 'chair', 'props'];
const categories = ['warmup', 'core', 'glutes', 'mobility', 'balance', 'upper-body', 'cooldown', 'full-body'];
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('נתוני השיעור אינם תקינים');
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 5000, fallback?: string): string {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'string' || value.length > max) throw new Error('שדה טקסט אינו תקין');
  return value;
}
function duration(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1 || value > 180) throw new Error('משך תרגיל אינו תקין');
  return value;
}
function strings(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error('רשימת פרטי התרגיל אינה תקינה');
  return value.map((v) => text(v));
}
function media(value: unknown): string | undefined {
  if (value === undefined || value === '') return undefined;
  const url = text(value, 2000);
  if (/^(https?:\/\/|\.\/|\/[^/])/.test(url)) return url;
  throw new Error('קישור מדיה אינו תקין');
}
export function parseExercise(value: unknown): Exercise {
  const v = object(value);
  if (!apparatus.includes(String(v.apparatus)) || !levels.slice(0, 3).includes(String(v.difficulty))) throw new Error('סוג התרגיל אינו תקין');
  if (v.category !== undefined && !categories.includes(String(v.category))) throw new Error('קטגוריה אינה תקינה');
  const id = text(v.id, 200);
  if (!id.trim()) throw new Error('מזהה תרגיל חסר');
  return {
    id, name: text(v.name, 300), englishName: text(v.englishName, 300, ''),
    apparatus: v.apparatus as Exercise['apparatus'], apparatusLabel: text(v.apparatusLabel, 200, ''),
    difficulty: v.difficulty as Exercise['difficulty'], difficultyLabel: text(v.difficultyLabel, 200, ''),
    category: v.category as Exercise['category'], categoryLabel: text(v.categoryLabel, 200, ''),
    targetMuscles: strings(v.targetMuscles ?? []), instructions: strings(v.instructions ?? []),
    durationMinutes: duration(v.durationMinutes), benefits: text(v.benefits, 5000, ''), breathing: text(v.breathing, 5000, ''),
    imageUrl: media(v.imageUrl), videoUrl: media(v.videoUrl),
  };
}
export function parseLesson(value: unknown): Lesson {
  const v = object(value);
  if (!levels.includes(String(v.level)) || !Array.isArray(v.exercises) || v.exercises.length > 200) throw new Error('מבנה השיעור אינו תקין');
  const id = text(v.id, 200);
  if (!id.trim()) throw new Error('מזהה שיעור חסר');
  const exercises = v.exercises.map((entry: unknown) => {
    const item = object(entry);
    return { exercise: parseExercise(item.exercise), customDuration: duration(item.customDuration), notes: text(item.notes, 5000, '') };
  });
  const totalDuration = exercises.reduce((sum, item) => sum + item.customDuration, 0);
  if (totalDuration > 1440) throw new Error('השיעור ארוך מדי');
  return {
    id, name: text(v.name, 300), description: text(v.description, 5000, ''),
    level: v.level as Lesson['level'], levelLabel: text(v.levelLabel, 200, ''), targetFocus: text(v.targetFocus, 1000, ''),
    exercises, totalDuration, createdAt: text(v.createdAt, 100, new Date().toISOString().slice(0, 10)), isCustom: v.isCustom !== false,
  };
}
export function parseLessons(value: unknown): Lesson[] {
  if (!Array.isArray(value) || value.length > 5000) throw new Error('רשימת שיעורים אינה תקינה');
  const lessons = value.map(parseLesson);
  if (new Set(lessons.map((l) => l.id)).size !== lessons.length) throw new Error('מזהי שיעורים כפולים');
  return lessons;
}
