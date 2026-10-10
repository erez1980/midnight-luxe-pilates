import type { Exercise, Lesson, LessonExercise } from '../types';

const blocks = [
  { category: 'warmup', weight: 16 }, { category: 'mobility', weight: 14 },
  { category: 'core', weight: 24 }, { category: 'glutes', weight: 20 },
  { category: 'balance', weight: 14 }, { category: 'cooldown', weight: 12 },
] as const;
export function buildAutoLesson(exercises: Exercise[], minutes: number, level: Lesson['level'], apparatus = 'all') {
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 120) throw new Error('משך השיעור חייב להיות בין 10 ל־120 דקות');
  const budget = blocks.map((b) => Math.floor(minutes * b.weight / 100));
  const remainderOrder = blocks.map((b, i) => ({ i, remainder: (minutes * b.weight) % 100 })).sort((a, b) => b.remainder - a.remainder);
  let remainder = minutes - budget.reduce((sum, n) => sum + n, 0);
  for (const { i } of remainderOrder) { if (remainder-- <= 0) break; budget[i]++; }
  const result: LessonExercise[] = [];
  const missing: string[] = [];
  const used = new Set<string>();
  blocks.forEach((block, index) => {
    let remaining = budget[index];
    const pool = exercises.filter((exercise) => exercise.category === block.category &&
      (level === 'mixed' ? exercise.difficulty !== 'advanced' : exercise.difficulty === level) &&
      (apparatus === 'all' || exercise.apparatus === apparatus) && !used.has(exercise.id));
    for (const exercise of pool) {
      if (!remaining) break;
      const customDuration = Math.min(Math.max(1, Math.round(exercise.durationMinutes)), remaining);
      result.push({ exercise, customDuration, notes: block.category === 'cooldown' ? 'לסיים עם נשימה והורדת עומס' : '' });
      used.add(exercise.id);
      remaining -= customDuration;
    }
    if (remaining) missing.push(block.category);
  });
  return { exercises: result, missing, duration: result.reduce((sum, e) => sum + e.customDuration, 0), requestedDuration: minutes };
}
