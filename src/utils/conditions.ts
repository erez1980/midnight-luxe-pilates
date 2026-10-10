import { Exercise } from '../types';
import { CONDITION_OVERRIDES } from './conditionOverrides';

// Special-conditions layer: for each exercise and condition (injury, pregnancy,
// postnatal…) the tool answers "suitable / needs modification / avoid", with
// the reason. Answers come from two places:
//   1. A DRAFT rules engine below: each exercise is tagged with movement
//      patterns (inversion, loaded spinal flexion, prone…) derived from its
//      name, and each condition maps patterns to a status. These follow common
//      Pilates contraindication guidelines but are NOT approved yet.
//   2. Rotem's reviewed decisions in conditionOverrides.ts, which always win
//      and are marked as approved.
// The UI must always show the draft/approved state and the medical disclaimer.

export type ConditionId = 'lower-back' | 'neck-shoulders' | 'knees' | 'osteoporosis' | 'pregnancy' | 'postnatal';
export type Suitability = 'suitable' | 'modify' | 'avoid';

export interface Condition {
  id: ConditionId;
  label: string;
  // Shown under the condition picker — context the instructor must keep in mind.
  note: string;
}

export const CONDITIONS: Condition[] = [
  { id: 'lower-back', label: 'גב תחתון', note: 'כאבי גב תחתון לא חריפים. בכאב חד, הקרנה לרגל או אחרי ניתוח — רק באישור גורם מטפל.' },
  { id: 'neck-shoulders', label: 'צוואר וכתפיים', note: 'רגישות או כאב בצוואר ובחגורת הכתפיים.' },
  { id: 'knees', label: 'ברכיים', note: 'כאבי ברכיים. לעבוד בטווח ללא כאב ועם ריפוד.' },
  { id: 'osteoporosis', label: 'אוסטאופורוזיס', note: 'דלדול עצם — הימנעות מכפיפה תחת עומס ומסיבוב בכפיפה.' },
  { id: 'pregnancy', label: 'הריון', note: 'באישור רופא/ה. ההתאמות מחמירות ככל שההריון מתקדם.' },
  { id: 'postnatal', label: 'אחרי לידה', note: 'אחרי אישור רפואי (לרוב כ-6 שבועות, אחרי קיסרי — לרוב יותר). לבדוק היפרדות שרירי בטן (דיאסטזיס).' },
];

export const SUITABILITY_LABEL: Record<Suitability, string> = {
  suitable: 'מתאים',
  modify: 'בהתאמה',
  avoid: 'להימנע',
};

export const DISCLAIMER =
  'כלי עזר למדריכות ומדריכים מוסמכים. ההמלצות כלליות, אינן תחליף לייעוץ רפואי, ויש להתאים כל תרגיל למתאמן/ת שמולך.';

// ---- movement patterns ----

type Trait =
  | 'inversion'
  | 'rolling'
  | 'flexionCurl'
  | 'seatedFlexion'
  | 'prone'
  | 'deepExtension'
  | 'plank'
  | 'plankLight'
  | 'twist'
  | 'kneeling'
  | 'kneeLoad'
  | 'overhead'
  | 'supine'
  | 'balance';

const TRAIT_PATTERNS: Record<Trait, RegExp> = {
  inversion: /jackknife|corkscrew|roll ?over|boomerang|control balance|tower|semi-circle|bear trap|hanging trapeze swing|spine massage/i,
  rolling: /rolling like a ball|\bseal\b|open leg rocker|boomerang|control balance/i,
  flexionCurl: /hundred|roll[ -]?up|roll back|teaser|single leg stretch|double leg stretch|criss cross|oblique curl|neck pull|coordination|round back/i,
  seatedFlexion: /spine stretch|roll down|forward melt|\bsaw\b|cat curl|stomach massage/i,
  prone: /swan|swimming|double leg kick|double kick|superman|^rocking$|grasshopper|pulling straps|long box|swakate/i,
  deepExtension: /swan dive|^rocking$|grasshopper|arched back|double leg kick|double kick/i,
  plank: /\bplank|push[ -]?ups?\b|long stretch|up stretch|down stretch|leg pull|snake|\bstar\b|knees off|mountain climb|table top|shoulder taps|elephant|long back stretch|pike/i,
  plankLight: /knee plank|push[ -]?up prep/i,
  twist: /twist|\bsaw\b|criss cross|corkscrew|russian|wood chop|tick tock|thread the needle/i,
  kneeling: /kneeling|child's pose|knee stretch|knees off|thigh stretch|knee plank|on knees|cat stretch|cat-cow|cat balance|bird dog|thread the needle|hip circles kneeling|balance point kneeling/i,
  kneeLoad: /squat|step up|front splits|going up|frog|footwork|running|prancing|single leg pumping|leg press|achilles|standing splits/i,
  overhead: /hang|pull[ -]?up|overhead|salute|push through bar|trapeze|airplane|spread eagle|monkey/i,
  supine: /hundred|footwork|bridge|leg springs|leg circle|feet in straps|pelvic (clock|tilt|lift)|floor angels|head nod|bicycle|walking on leg springs|knee to chest|leg beats|backstroke|angels in the snow|hamstring stretch in straps|breathing|ankle springs|double leg circles|full body stretch|scissors|frog in straps/i,
  balance: /balance|standing|step up|foam roller/i,
};

// Mat Bicycle and Scissors are classically performed inverted (hips lifted).
function isInvertedMatClassic(ex: Exercise) {
  return ex.apparatus === 'mat' && /^(bicycle|scissors)$/i.test(ex.englishName.trim());
}

export function exerciseTraits(ex: Exercise): Set<Trait> {
  const traits = new Set<Trait>();
  const name = ex.englishName.trim();
  (Object.keys(TRAIT_PATTERNS) as Trait[]).forEach((trait) => {
    if (TRAIT_PATTERNS[trait].test(name)) traits.add(trait);
  });
  if (isInvertedMatClassic(ex)) traits.add('inversion');
  if (traits.has('plankLight')) traits.delete('plank');
  return traits;
}

// ---- draft rules: condition → pattern → status + reason ----

type Rule = { status: Exclude<Suitability, 'suitable'>; reason: string };

const RULES: Record<ConditionId, Partial<Record<Trait, Rule>>> = {
  'lower-back': {
    inversion: { status: 'avoid', reason: 'היפוך ועומס על עמוד השדרה' },
    rolling: { status: 'avoid', reason: 'גלגול על עמוד השדרה' },
    deepExtension: { status: 'avoid', reason: 'יישור עמוק של הגב התחתון' },
    flexionCurl: { status: 'modify', reason: 'כפיפה תחת עומס — ראש על המזרן, טווח קטן' },
    seatedFlexion: { status: 'modify', reason: 'כפיפה קדימה — טווח מבוקר, בלי לדחוף' },
    prone: { status: 'modify', reason: 'יישור בשכיבה על הבטן — טווח קטן' },
    twist: { status: 'modify', reason: 'סיבוב — טווח קטן עם אגן יציב' },
    plank: { status: 'modify', reason: 'פלאנק — לשמור אגן ניטרלי, לקצר זמן' },
  },
  'neck-shoulders': {
    inversion: { status: 'avoid', reason: 'עומס משקל הגוף על הצוואר והכתפיים' },
    flexionCurl: { status: 'modify', reason: 'הרמת ראש — להשאיר ראש על המזרן או בתמיכה' },
    rolling: { status: 'modify', reason: 'גלגול — להימנע מגלגול אל הצוואר' },
    plank: { status: 'modify', reason: 'נשיאת משקל על הידיים — גרסה מקוצרת או על הברכיים' },
    overhead: { status: 'modify', reason: 'ידיים מעל הראש / תלייה — טווח ללא כאב, התנגדות קלה' },
    prone: { status: 'modify', reason: 'יישור בשכיבה על הבטן — צוואר ארוך, מבט לרצפה' },
  },
  knees: {
    kneeling: { status: 'modify', reason: 'עמידת ברכיים — ריפוד מתחת לברכיים או חלופה' },
    kneeLoad: { status: 'modify', reason: 'כפיפת ברך תחת עומס — טווח ללא כאב, קפיצים קלים' },
  },
  osteoporosis: {
    inversion: { status: 'avoid', reason: 'היפוך וכפיפה תחת עומס — סיכון לשבר דחיסה' },
    rolling: { status: 'avoid', reason: 'גלגול על עמוד השדרה' },
    flexionCurl: { status: 'avoid', reason: 'כפיפת עמוד שדרה תחת עומס — סיכון לשבר דחיסה' },
    seatedFlexion: { status: 'avoid', reason: 'כפיפה קדימה — להחליף בהארכה של עמוד השדרה' },
    twist: { status: 'modify', reason: 'סיבוב — טווח קטן עם עמוד שדרה ארוך, בלי כפיפה' },
    balance: { status: 'modify', reason: 'שיווי משקל — לעבוד ליד תמיכה (סיכון לנפילה)' },
    deepExtension: { status: 'modify', reason: 'יישור — טווח מבוקר, בלי עומס חיצוני' },
  },
  pregnancy: {
    inversion: { status: 'avoid', reason: 'היפוך — לא מומלץ בהריון' },
    rolling: { status: 'avoid', reason: 'גלגול על עמוד השדרה' },
    prone: { status: 'avoid', reason: 'שכיבה על הבטן' },
    flexionCurl: { status: 'avoid', reason: 'כפיפת בטן עם הרמת ראש — עומס על קו האמצע' },
    deepExtension: { status: 'avoid', reason: 'יישור עמוק — מתיחת דופן הבטן' },
    overhead: { status: 'modify', reason: 'תלייה / ידיים מעל הראש — להעדיף גרסה יציבה' },
    plank: { status: 'modify', reason: 'פלאנק — קצר או על הברכיים, לשים לב להתבלטות הבטן' },
    twist: { status: 'modify', reason: 'סיבוב — טווח קטן, בלי כפיפה' },
    supine: { status: 'modify', reason: 'שכיבה על הגב — אחרי השליש הראשון לקצר או להגביה את פלג הגוף העליון' },
    balance: { status: 'modify', reason: 'שינויי שיווי משקל — לעבוד ליד תמיכה' },
  },
  postnatal: {
    inversion: { status: 'avoid', reason: 'היפוך — לחץ תוך-בטני גבוה' },
    rolling: { status: 'avoid', reason: 'גלגול — עומס על קו האמצע' },
    flexionCurl: { status: 'avoid', reason: 'כפיפת בטן עם הרמת ראש — עומס על קו האמצע (דיאסטזיס)' },
    plank: { status: 'avoid', reason: 'פלאנק מלא — לחץ תוך-בטני; להתחיל מגרסה על הברכיים' },
    plankLight: { status: 'modify', reason: 'נשיאת משקל קלה — לשים לב להתבלטות הבטן ולרצפת האגן' },
    deepExtension: { status: 'modify', reason: 'יישור — טווח מבוקר' },
    prone: { status: 'modify', reason: 'שכיבה על הבטן — רגישות בחזה בתקופת הנקה' },
    twist: { status: 'modify', reason: 'סיבוב — טווח קטן עם הפעלת בטן עמוקה' },
    seatedFlexion: { status: 'modify', reason: 'כפיפה — טווח מבוקר עם נשיפה' },
  },
};

export interface Assessment {
  status: Suitability;
  reasons: string[];
  approved: boolean; // true = reviewed by Rotem (override), false = draft rule
}

const RANK: Record<Suitability, number> = { suitable: 0, modify: 1, avoid: 2 };

export function assessExercise(ex: Exercise, condition: ConditionId): Assessment {
  const override = CONDITION_OVERRIDES[ex.id]?.[condition];
  if (override) {
    return { status: override.status, reasons: override.note ? [override.note] : [], approved: true };
  }
  const rules = RULES[condition];
  let status: Suitability = 'suitable';
  const reasons: string[] = [];
  exerciseTraits(ex).forEach((trait) => {
    const rule = rules[trait];
    if (!rule) return;
    if (RANK[rule.status] > RANK[status]) status = rule.status;
    if (!reasons.includes(rule.reason)) reasons.push(rule.reason);
  });
  return { status, reasons, approved: false };
}

// Combined assessment for several conditions at once (e.g. a lesson for a
// postnatal client with lower-back pain): the strictest status wins.
export function assessForConditions(ex: Exercise, conditions: ConditionId[]) {
  const perCondition = conditions.map((id) => ({ id, ...assessExercise(ex, id) }));
  const status = perCondition.reduce<Suitability>(
    (worst, a) => (RANK[a.status] > RANK[worst] ? a.status : worst),
    'suitable'
  );
  return { status, perCondition };
}

export function conditionLabel(id: ConditionId) {
  return CONDITIONS.find((c) => c.id === id)?.label ?? id;
}

export function isConditionId(value: unknown): value is ConditionId {
  return typeof value === 'string' && CONDITIONS.some((c) => c.id === value);
}
