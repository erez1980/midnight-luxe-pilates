// The health declaration's questions and validation, shared by the form on
// the site (src/site/health/) and the `health-declaration` Edge Function, so
// the server checks exactly what the visitor saw. Plain TypeScript only: this
// file runs both in the browser bundle and in Deno.

// Bump when the questions or the declaration text change; stored on each row.
export const FORM_VERSION = '2026-11-05';

export type Answer = 'yes' | 'no' | 'na';

export interface HealthQuestion {
  id: string;
  text: string;
  // Shown under the details box when the answer is "yes".
  detailsLabel: string;
  // Questions that only apply to some people offer "לא רלוונטי".
  allowNotRelevant?: boolean;
}

// The first eight come from the original Google Form; `doctor` was added
// because a doctor's instruction to avoid exercise matters most of all.
export const HEALTH_QUESTIONS: HealthQuestion[] = [
  {
    id: 'heart',
    text: 'האם אובחנת בעבר או כיום במחלת לב, לחץ דם גבוה או בעיה במערכת הלב וכלי הדם?',
    detailsLabel: 'מה האבחנה, ומתי?',
  },
  {
    id: 'condition',
    text: 'האם יש לך בעיה רפואית, פציעה או כאב שעלולים להשפיע על ביצוע פעילות גופנית?',
    detailsLabel: 'במה מדובר?',
  },
  {
    id: 'surgery',
    text: 'האם עברת ניתוח או אשפוז רפואי בתקופה האחרונה?',
    detailsLabel: 'איזה ניתוח או אשפוז, ומתי?',
  },
  {
    id: 'joints',
    text: 'האם קיימות בעיות גב, צוואר, מפרקים, ברכיים, כתפיים או פציעות אחרות?',
    detailsLabel: 'איפה, ומה מרגישים?',
  },
  {
    id: 'symptoms',
    text: 'האם את/ה סובל/ת מסחרחורות, עילפון, קוצר נשימה חריג או כאבים בחזה במהלך מאמץ?',
    detailsLabel: 'מה קורה, ובאיזה מצב?',
  },
  {
    id: 'medication',
    text: 'האם את/ה נוטל/ת תרופות באופן קבוע שעשויות להשפיע על האימון או על היכולת לבצע פעילות גופנית?',
    detailsLabel: 'אילו תרופות?',
  },
  {
    id: 'doctor',
    text: 'האם רופא/ה המליץ/ה לך להימנע מפעילות גופנית או להגביל אותה?',
    detailsLabel: 'מה ההמלצה?',
  },
  {
    id: 'other',
    text: 'האם יש מצב רפואי אחר, מגבלה פיזית או מידע בריאותי שהמדריכה צריכה לדעת לפני האימון?',
    detailsLabel: 'מה חשוב שרתם תדע?',
  },
  {
    id: 'pregnancy',
    text: 'לנשים: האם את בהריון או בתקופה שלאחר לידה?',
    detailsLabel: 'באיזה שבוע, או כמה זמן אחרי הלידה?',
    allowNotRelevant: true,
  },
];

export const DECLARATION_TITLE = 'הצהרת המתאמן/ת';

export const DECLARATION_PARAGRAPHS = [
  'אני מצהיר/ה כי המידע שמסרתי בטופס זה נכון ומלא ככל הידוע לי.',
  'אני מבין/ה כי שיעור פילאטיס הוא פעילות גופנית וכי ביצוע תרגילים עלול להיות כרוך במאמץ גופני ובסיכון לפציעה. אני מתחייב/ת ליידע את המדריכה לפני האימון על כל שינוי במצבי הבריאותי, כאב, פציעה או מגבלה חדשה.',
  'במקרה של כאב, סחרחורת, קוצר נשימה חריג או תחושה לא טובה במהלך האימון, אפסיק את הפעילות ואיידע מיד את המדריכה.',
  'במידת הצורך, אני מתחייב/ת להתייעץ עם רופא/ה או גורם רפואי מוסמך לפני השתתפות בפעילות גופנית.',
];

export interface HealthSubmission {
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  phone: string;
  email: string;
  emergencyName: string;
  emergencyPhone: string;
  answers: Record<string, { answer: Answer | ''; details: string }>;
  guardianName: string;
  signature: string; // data:image/png;base64,...
  consentDeclaration: boolean;
  consentPrivacy: boolean;
  website: string; // honeypot: real people leave it empty
}

export const digitsOnly = (s: string) => s.replace(/\D/g, '').replace(/^972/, '0');

// Israeli mobile or landline, with or without +972 / dashes.
export const isValidPhone = (s: string) => /^0(5\d|[2-4]|[89]|7\d)\d{7}$/.test(digitsOnly(s));

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

export function ageOn(birthDate: string, today = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < mo || (today.getMonth() + 1 === mo && today.getDate() < d)) age--;
  return age;
}

export const MAX_TEXT = 1000;
const MAX_SIGNATURE = 400_000; // ~300 KB of PNG

// Returns field id → Hebrew error message. Empty object means valid.
export function validateSubmission(s: HealthSubmission, today = new Date()): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = s.fullName.trim();
  if (name.length < 2) errors.fullName = 'נא למלא שם מלא';
  const age = ageOn(s.birthDate, today);
  if (age === null) errors.birthDate = 'נא לבחור תאריך לידה';
  else if (age < 5 || age > 110) errors.birthDate = 'נא לבדוק את תאריך הלידה';
  if (!isValidPhone(s.phone)) errors.phone = 'נא למלא מספר טלפון ישראלי תקין';
  if (s.email.trim() && !isValidEmail(s.email.trim())) errors.email = 'כתובת המייל לא נראית תקינה';
  if (s.emergencyName.trim().length < 2) errors.emergencyName = 'נא למלא שם של איש/אשת קשר';
  if (!isValidPhone(s.emergencyPhone)) errors.emergencyPhone = 'נא למלא מספר טלפון תקין';
  else if (digitsOnly(s.emergencyPhone) === digitsOnly(s.phone)) errors.emergencyPhone = 'נא למלא טלפון של אדם אחר';

  for (const q of HEALTH_QUESTIONS) {
    const a = s.answers[q.id];
    const allowed: Answer[] = q.allowNotRelevant ? ['yes', 'no', 'na'] : ['yes', 'no'];
    if (!a || !allowed.includes(a.answer as Answer)) errors[`q_${q.id}`] = 'נא לבחור תשובה';
    else if (a.answer === 'yes' && a.details.trim().length < 2) errors[`q_${q.id}`] = 'נא לפרט בכמה מילים';
    else if (a.details.length > MAX_TEXT) errors[`q_${q.id}`] = 'הפירוט ארוך מדי';
  }

  if (age !== null && age < 18 && s.guardianName.trim().length < 2) {
    errors.guardianName = 'מתחת לגיל 18 נדרש שם הורה או אפוטרופוס';
  }
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(s.signature) || s.signature.length > MAX_SIGNATURE) {
    errors.signature = 'נא לחתום בתיבת החתימה';
  }
  if (!s.consentDeclaration) errors.consentDeclaration = 'נא לאשר את ההצהרה';
  if (!s.consentPrivacy) errors.consentPrivacy = 'נא לאשר את שמירת המידע';
  for (const k of ['fullName', 'email', 'emergencyName', 'guardianName'] as const) {
    if (s[k].length > 200) errors[k] = 'הטקסט ארוך מדי';
  }
  return errors;
}

export const ANSWER_LABEL: Record<Answer, string> = { yes: 'כן', no: 'לא', na: 'לא רלוונטי' };
