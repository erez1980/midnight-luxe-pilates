import type { Exercise, Lesson } from '../src/types';
export const exercise: Exercise = {
  id: 'mat-core', name: 'תרגיל בדיקה', englishName: 'Test', apparatus: 'mat', apparatusLabel: 'מזרן',
  difficulty: 'beginner', difficultyLabel: 'מתחילים', category: 'core', categoryLabel: 'ליבה',
  targetMuscles: ['ליבה'], durationMinutes: 5, instructions: ['תנועה מבוקרת'], benefits: 'חיזוק', breathing: 'נשימה',
};
export const lesson: Lesson = {
  id: 'lesson-test', name: 'שיעור בדיקה', description: '', level: 'beginner', levelLabel: 'מתחילים',
  targetFocus: 'ליבה', exercises: [{ exercise, customDuration: 5, notes: '' }], totalDuration: 5, createdAt: '2026-10-09', isCustom: true,
};
export class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}
