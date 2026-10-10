import type { ConditionId, Suitability } from './conditions';

// Rotem's reviewed decisions. Anything listed here replaces the draft rule
// for that exercise + condition, and shows in the app as approved.
//
// To fill it from the review sheet (docs/conditions-review.csv): for every row
// Rotem changes or confirms, add an entry keyed by the exercise id, e.g.
//
//   mat_hundred: {
//     pregnancy: { status: 'modify', note: 'רק בשליש הראשון, ראש על המזרן' },
//     'lower-back': { status: 'suitable' },
//   },
export const CONDITION_OVERRIDES: Record<
  string,
  Partial<Record<ConditionId, { status: Suitability; note?: string }>>
> = {};
