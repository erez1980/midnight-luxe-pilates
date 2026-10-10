import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAutoLesson } from '../../src/utils/autoBuild.ts';
import { readDraft, writeDraft } from '../../src/utils/drafts.ts';
import { parseLesson, parseLessons } from '../../src/utils/lessonValidation.ts';
import { buildPrintHtml } from '../../src/utils/lessonExport.ts';
import { exerciseDeadline, remainingSeconds } from '../../src/utils/timer.ts';
import { INITIAL_EXERCISES, INITIAL_LESSONS } from '../../src/data.ts';
import { exercise, lesson, MemoryStorage } from '../fixtures.ts';
import type { Exercise } from '../../src/types';
beforeEach(() => { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: new MemoryStorage() }); });

test('complete auto-generated lessons meet requested durations exactly', () => {
  const pool: Exercise[] = ['warmup', 'mobility', 'core', 'glutes', 'balance', 'cooldown'].flatMap((category) =>
    Array.from({ length: 20 }, (_, i) => ({ ...exercise, id: `${category}-${i}`, category: category as Exercise['category'], durationMinutes: 3 })));
  for (const minutes of [20, 30, 45, 60, 90, 120]) {
    const result = buildAutoLesson(pool, minutes, 'beginner');
    assert.equal(result.duration, minutes);
    assert.deepEqual(result.missing, []);
    assert.ok(result.exercises.every((item) => item.customDuration > 0));
  }
});
test('missing categories are reported and mixed level excludes advanced exercises', () => {
  const result = buildAutoLesson([{ ...exercise, difficulty: 'advanced' }], 30, 'mixed');
  assert.equal(result.duration, 0);
  assert.equal(result.missing.length, 6);
  assert.throws(() => buildAutoLesson([], -30, 'beginner'));
});
test('existing exercise data and example lessons remain compatible with validation', () => {
  for (const item of INITIAL_EXERCISES) parseLesson({ ...lesson, exercises: [{ exercise: item, customDuration: item.durationMinutes }] });
  assert.equal(parseLessons(INITIAL_LESSONS).length, INITIAL_LESSONS.length);
});
test('drafts survive reloads without leaking into another account', () => {
  const draft = { lessonName: 'טיוטה', description: '', level: lesson.level, targetFocus: '', exercises: lesson.exercises, autoBuildDuration: 45 };
  writeDraft('A', undefined, draft);
  assert.equal(readDraft('A').draft?.lessonName, 'טיוטה');
  assert.equal(readDraft('B').draft, null);
  localStorage.setItem('pilates:draft:v3:A:new', 'invalid');
  assert.equal(readDraft('A').error, true);
  assert.equal(localStorage.getItem('pilates:draft:v3:A:new'), 'invalid');
});
test('malformed imported lessons, negative durations and unsafe media are rejected', () => {
  assert.throws(() => parseLesson({ ...lesson, exercises: [{ exercise, customDuration: -1 }] }));
  assert.throws(() => parseLesson({ ...lesson, exercises: [{ exercise: { ...exercise, imageUrl: 'javascript:alert(1)' }, customDuration: 5 }] }));
  assert.throws(() => parseLesson({ name: 'missing fields' }));
  assert.throws(() => parseLessons([lesson, lesson]));
  assert.equal(parseLesson({ ...lesson, totalDuration: 999 }).totalDuration, 5);
});
test('printed names, descriptions, exercise content and notes remain text', () => {
  const payload = '<img src=x onerror="parent.pwned=true">';
  const html = buildPrintHtml({ ...lesson, name: '</title><script>parent.pwned=true</script>', description: payload,
    targetFocus: payload, exercises: [{ exercise: { ...exercise, name: payload, benefits: payload }, customDuration: 5, notes: payload }] });
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('<img src=x'), false);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img'));
});
test('each new exercise deadline uses its full duration, and the timer never goes negative', () => {
  const deadline = exerciseDeadline(1000, 5);
  assert.equal(remainingSeconds(deadline, 1000), 300);
  assert.equal(remainingSeconds(deadline, 301000), 0);
  assert.equal(remainingSeconds(deadline, 900000), 0);
});
