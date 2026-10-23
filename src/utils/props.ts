import { Exercise } from '../types';

// Small equipment ("props") a lesson can be built around. Exercises from the
// base library are tagged by their English name; the newer prop exercises in
// propExercises.ts carry an explicit `props` list.

export type PropId =
  | 'stick'
  | 'small-ball'
  | 'physio-ball'
  | 'ring'
  | 'band'
  | 'dumbbells'
  | 'pita'
  | 'foam-roller'
  | 'weighted-ball';

export interface PropDef {
  id: PropId;
  label: string;
  match?: RegExp; // how base-library exercises are recognised
}

export const PROPS: PropDef[] = [
  { id: 'stick', label: 'מקל', match: /\bstick\b/i },
  { id: 'small-ball', label: 'כדור קטן', match: /mini ball|small ball|with ball\b/i },
  { id: 'physio-ball', label: 'כדור פיזיו', match: /physio ball|stability ball|swiss ball/i },
  { id: 'ring', label: 'טבעת (Magic Circle)', match: /magic circle/i },
  { id: 'band', label: 'גומייה', match: /\bband\b/i },
  { id: 'dumbbells', label: 'משקולות', match: /dumbbell/i },
  { id: 'pita', label: 'פיתה (דיסק איזון)', match: /balance disc/i },
  { id: 'foam-roller', label: 'גליל קצף (Foam Roller)', match: /foam roller/i },
  { id: 'weighted-ball', label: 'כדור משקל', match: /weighted ball/i },
];

export const DUMBBELL_WEIGHTS = [1, 1.5, 2] as const;
export const MAX_LESSON_PROPS = 2;

export function isPropId(value: unknown): value is PropId {
  return typeof value === 'string' && PROPS.some((p) => p.id === value);
}

export function propLabel(id: PropId, dumbbellKg?: number) {
  const label = PROPS.find((p) => p.id === id)?.label ?? id;
  return id === 'dumbbells' && dumbbellKg ? `${label} ${dumbbellKg.toLocaleString('he-IL')} ק״ג` : label;
}

export function exerciseProps(ex: Exercise): PropId[] {
  if (ex.props?.length) return ex.props.filter(isPropId);
  return PROPS.filter((p) => p.match?.test(ex.englishName)).map((p) => p.id);
}
