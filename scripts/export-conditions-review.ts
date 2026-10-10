// Writes docs/conditions-review.csv: every exercise × condition with the
// current (draft or approved) status and reasons, for Rotem to review in a
// spreadsheet. Run: npx tsx scripts/export-conditions-review.ts
import { writeFileSync } from 'node:fs';
import { INITIAL_EXERCISES } from '../src/data';
import { CONDITIONS, SUITABILITY_LABEL, assessExercise } from '../src/utils/conditions';

const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
const header = ['exercise_id', 'שם התרגיל', 'English name', 'ציוד', 'רמה', ...CONDITIONS.flatMap((c) => [c.label, `${c.label} — סיבה`]), 'הערות רתם'];
const rows = INITIAL_EXERCISES.map((ex) => [
  ex.id,
  ex.name,
  ex.englishName,
  ex.apparatusLabel,
  ex.difficultyLabel,
  ...CONDITIONS.flatMap((c) => {
    const a = assessExercise(ex, c.id);
    return [SUITABILITY_LABEL[a.status] + (a.approved ? '' : ' (טיוטה)'), a.reasons.join('; ')];
  }),
  '',
]);
// BOM so Excel opens the Hebrew correctly.
const csv = '﻿' + [header, ...rows].map((r) => r.map((v) => esc(String(v))).join(',')).join('\n');
writeFileSync('docs/conditions-review.csv', csv);

const counts = CONDITIONS.map((c) => {
  const tally = { suitable: 0, modify: 0, avoid: 0 };
  INITIAL_EXERCISES.forEach((ex) => tally[assessExercise(ex, c.id).status]++);
  return `${c.label}: ✅${tally.suitable} ⚠️${tally.modify} ⛔${tally.avoid}`;
});
console.log(`${INITIAL_EXERCISES.length} exercises\n${counts.join('\n')}`);
