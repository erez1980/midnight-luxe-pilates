// Everything Retem will want to change lives in this one file: contact
// details, photos, copy. Sections whose data is empty (no testimonials yet, no
// photo yet) fall back gracefully or don't render at all.

export const BRAND = {
  name: 'פילאטיס בתנועה',
  owner: 'רתם',
  certification: 'מוסמכת להדרכת פילאטיס מזרן ופילאטיס מכשירים, דרך מרתה פילאטיס',
};

export const CONTACT = {
  // International format, digits only, e.g. '972501234567'. Empty = hidden.
  whatsapp: '972548024606',
  // Display format, e.g. '050-123-4567'. Empty = hidden.
  phone: '054-802-4606',
  email: 'rotem1980.shapira@gmail.com',
  instagram: 'https://www.instagram.com/rotem_shap/',
  facebook: '',
  preferredChannelLabel: 'וואטסאפ',
  whatsappGreeting: 'היי רתם, הגעתי מהאתר ואשמח לשמוע על שיעורי הפילאטיס 🙂',
};

// Paths are relative to the site root (public/). null = elegant emblem
// placeholder instead of a photo. Portrait ~4:5 works best for both.
export const PHOTOS: { hero: string | null; about: string | null } = {
  hero: null,
  about: null,
};

export const NAV_LINKS = [
  { href: '#about', label: 'על רתם' },
  { href: '#classes', label: 'השיעורים' },
  { href: '#book', label: 'הזמנות ואירועים' },
  { href: '#tool', label: 'למדריכות' },
  { href: '#faq', label: 'שאלות נפוצות' },
  { href: '#contact', label: 'צרו קשר' },
];

export const HERO = {
  eyebrow: 'רתם · מדריכת פילאטיס עצמאית · עמק יזרעאל',
  title: ['תנועה', 'שמתחילה', 'מבפנים.'],
  subtitle:
    'שיעורי פילאטיס מזרן ומכשירים — בסטודיו, באירוע או אצלכם. ולמדריכות: כלי לבניית שיעורים, עם התאמה לפציעות ולמצבים מיוחדים.',
  primaryCta: 'להזמנת שיעור',
  secondaryCta: 'לבניית שיעור',
  highlights: ['הסמכה במזרן ובמכשירים', 'מגיעה אליכם — עמק יזרעאל והסביבה', 'שיעורים לאירועים ולקבוצות'],
};

export const PRINCIPLES_TICKER = ['נשימה', 'מרכז', 'שליטה', 'דיוק', 'זרימה', 'ריכוז'];

export const ABOUT = {
  title: 'נעים להכיר, אני רתם',
  paragraphs: [
    'אני רתם, מדריכת פילאטיס מזרן ומכשירים.',
    'בשיעורים שלי הדגש הוא על נשימה, יציבה ותנועה מבוקרת, עם תשומת לב לרמה ולצרכים של כל מתאמנת ומתאמן.',
  ],
  signature: 'רתם',
};

export const CLASSES = [
  {
    id: 'mat',
    title: 'פילאטיס מזרן',
    text: 'הבסיס של השיטה: עבודה עם משקל הגוף, נשימה ושליטה. מחזק את שרירי הליבה, משפר יציבה וגמישות — ומלמד את הגוף לנוע נכון גם מחוץ לשיעור.',
    points: ['חיזוק עמוק של שרירי הליבה', 'שיפור יציבה וגמישות', 'בקבוצה של עד 15 משתתפים'],
  },
  {
    id: 'apparatus',
    title: 'פילאטיס מכשירים',
    text: 'עבודה על רפורמר ומכשירי פילאטיס נוספים, עם קפיצים שמספקים התנגדות ותמיכה בדיוק במקום הנכון. אימון מגוון, מאתגר ועדין למפרקים.',
    points: ['התנגדות מותאמת לכל גוף', 'עבודה מדויקת ומבוקרת', 'קבוצות קטנות, לפי מספר המכשירים בסטודיו'],
  },
];

// Prices confirmed by Rotem. `cta` picks the button: 'book' opens WhatsApp
// with Rotem directly, 'schedule' asks her for studio locations and times.
// `prices` (optional) lists several price points inside one card.
type Plan = {
  id: string;
  featured: boolean;
  name: string;
  price: string;
  unit: string;
  prices?: { label: string; price: string }[];
  text: string;
  points: string[];
  cta: 'book' | 'schedule';
  ctaLabel: string;
};

// Hidden while Rotem works freelance (no studio of her own yet). The data is
// kept so the section can return by flipping this flag.
export const SHOW_PRICING = false;

export const PRICING: { title: string; intro: string; plans: Plan[] } = {
  title: 'איך מתחילים?',
  intro: 'אפשר להתחיל בשיעור ניסיון, לבחור בשיעור פרטי או זוגי, או להצטרף לשיעור קבוצתי בסטודיו.',
  plans: [
    {
      id: 'trial',
      featured: true,
      name: 'שיעור ניסיון',
      price: '',
      unit: '50 דקות',
      prices: [
        { label: 'בקבוצה', price: '50 ₪' },
        { label: 'פרטי', price: '100 ₪' },
      ],
      text: 'הדרך הכי טובה להכיר את השיטה, את הגוף שלך — ואותי.',
      points: ['שיעור מלא של 50 דקות', 'מתאים גם בלי שום ניסיון קודם'],
      cta: 'book',
      ctaLabel: 'לתיאום שיעור ניסיון',
    },
    {
      id: 'private',
      featured: false,
      name: 'שיעור פרטי',
      price: '180 ₪',
      unit: 'לשיעור',
      text: 'שיעור אחד על אחד, שבנוי סביב הגוף, הקצב והמטרות שלך.',
      points: ['50 דקות', 'מזרן או מכשירים', 'בתיאום מראש ישירות מול רתם'],
      cta: 'book',
      ctaLabel: 'לתיאום שיעור פרטי',
    },
    {
      id: 'pair',
      featured: false,
      name: 'שיעור זוגי',
      price: '70 ₪',
      unit: 'לאדם',
      text: 'מתאמנים בשניים — עם חברה, בן או בת זוג — ועדיין עם תשומת לב אישית.',
      points: ['50 דקות', 'שיעור לשני משתתפים', 'בתיאום מראש ישירות מול רתם'],
      cta: 'book',
      ctaLabel: 'לתיאום שיעור זוגי',
    },
    {
      id: 'group',
      featured: false,
      name: 'שיעור קבוצתי',
      price: 'לפי הסטודיו',
      unit: '',
      text: 'שיעורים קבוצתיים שאני מעבירה בסטודיו ״לעוף על הגוף״ בעין חרוד איחוד. המחיר וההרשמה לפי הסטודיו.',
      points: ['מזרן: עד 15 משתתפים', 'מכשירים: לפי מספר המכשירים בסטודיו', 'ההרשמה דרך מערכת השעות של הסטודיו'],
      cta: 'schedule',
      ctaLabel: 'לבירור שעות ומיקום',
    },
  ],
};

// "Book me" — Rotem is a freelancer who comes to wherever the class is.
// Each option becomes a card and a choice in the inquiry form; the form
// composes a WhatsApp message so the inquiry arrives already organized.
export const BOOKING = {
  title: 'מזמינים אותי. אני מגיעה.',
  intro:
    'אני מדריכה עצמאית ומגיעה לאן שצריך באזור עמק יזרעאל והסביבה — לאירוע, לסטודיו או אליכם. ספרו לי מה אתם מתכננים, ונבנה יחד את השיעור המתאים.',
  options: [
    {
      id: 'event',
      title: 'שיעור לאירוע',
      text: 'ערב נשים, יום גיבוש, יום הולדת או כל מפגש שרוצים להכניס אליו רגע של תנועה ונשימה.',
      points: ['שיעור פילאטיס מזרן כחלק מהאירוע', 'מותאם לקבוצה ולרמת המשתתפים'],
    },
    {
      id: 'studio',
      title: 'הדרכה בסטודיו',
      text: 'לסטודיואים שמחפשים מדריכה לשיעורים קבועים או להחלפות — מזרן ומכשירים.',
      points: ['שיעורים קבועים או החלפות', 'הסמכה במזרן ובמכשירים'],
    },
    {
      id: 'private',
      title: 'שיעור פרטי או זוגי',
      text: 'שיעור אישי, לבד או בזוג, שבנוי סביב הגוף, הקצב והמטרות שלכם.',
      points: ['50 דקות', 'במקום שנוח לכם או במקום מוסכם'],
    },
  ],
  form: {
    title: 'ספרו לי על השיעור',
    note: 'הטופס פותח הודעת וואטסאפ מוכנה — אפשר לערוך אותה לפני השליחה.',
    submit: 'שליחה בוואטסאפ',
  },
};

// The lesson-builder tool — for Rotem and for other instructors.
export const TOOL = {
  title: 'בונים שיעור. בדיוק לגוף שמולך.',
  intro:
    'כלי עבודה למדריכות ומדריכי פילאטיס: מאגר תרגילים, בניית מערך שיעור והדרכה חיה — עם התאמה לפציעות ולמצבים מיוחדים כמו הריון ואחרי לידה.',
  features: [
    { id: 'library', title: 'מאגר תרגילים', text: 'מאות תרגילי מזרן ומכשירים, עם הנחיות, נשימה ודגשים.' },
    { id: 'conditions', title: 'התאמה למצבים מיוחדים', text: 'בוחרים מצב — גב תחתון, הריון, אחרי לידה ועוד — ורואים מה מתאים, מה דורש התאמה וממה להימנע.' },
    { id: 'builder', title: 'בניית מערך שיעור', text: 'מסדרים חימום, גוף השיעור ושחרור — ושומרים לשימוש חוזר.' },
    { id: 'coach', title: 'מצב הדרכה חי', text: 'מעבירים את השיעור מהטלפון, תרגיל אחרי תרגיל, עם טיימר.' },
  ],
  cta: 'כניסה לכלי',
};

export const AUDIENCE = [
  'מי שמתחילים עכשיו ורוצים להיכנס לתנועה בבטחה',
  'מתאמנים ותיקים שרוצים לדייק ולהעמיק',
  'מי שיושבים שעות מול מסך ומרגישים את זה בגב',
  'מי שמחפשים אימון עדין למפרקים ומחזק באמת',
  'ספורטאים שרוצים ליבה חזקה ותנועה יעילה',
  'כל מי שרוצה לצאת מאימון רגוע יותר משנכנס',
];

// The six classic Pilates principles.
export const PRINCIPLES = [
  { title: 'נשימה', text: 'הנשימה מובילה את התנועה ומחברת בין הגוף לראש.' },
  { title: 'מרכז', text: 'כל תנועה יוצאת מהליבה — "בית הכוח" של הגוף.' },
  { title: 'שליטה', text: 'אין תנועה מקרית. כל תרגיל נעשה בשליטה מלאה.' },
  { title: 'דיוק', text: 'מעט חזרות, עשויות נכון. איכות לפני כמות.' },
  { title: 'זרימה', text: 'תנועה רציפה ורכה, שעוברת מתרגיל לתרגיל.' },
  { title: 'ריכוז', text: 'נוכחות מלאה בשיעור — זמן אמיתי לעצמך.' },
];

// Hidden for the same reason as pricing — the booking section replaces it.
export const SHOW_LOCATIONS = false;

export const LOCATIONS = {
  title: 'איפה מתאמנים?',
  text: 'ההרשמה לשיעורים הקבוצתיים היא דרך מערכת השעות של הסטודיו. שיעורים פרטיים וזוגיים מתואמים ישירות איתי.',
  areas: ['עמק יזרעאל והסביבה'],
  studios: [{ name: 'לעוף על הגוף', address: 'עין חרוד איחוד' }] as { name: string; address?: string; url?: string }[],
  scheduleUrl: '',
  comingSoon: '',
};

// Real quotes only — the section is hidden while this list is empty.
export const TESTIMONIALS: { quote: string; name: string }[] = [];

export const FAQ = [
  {
    q: 'אין לי שום ניסיון בפילאטיס. זה מתאים לי?',
    a: 'בהחלט. כל שיעור מותאם לרמה של מי שנמצא בו, ואני מלווה צעד אחרי צעד — בלי לחץ ובלי השוואות.',
  },
  {
    q: 'מה ההבדל בין פילאטיס מזרן לפילאטיס מכשירים?',
    a: 'במזרן עובדים עם משקל הגוף ועם אביזרים קטנים. במכשירים, כמו הרפורמר, מערכת קפיצים מוסיפה התנגדות ותמיכה — מה שמאפשר גם לאתגר וגם להקל. שתי השיטות משלימות זו את זו.',
  },
  {
    q: 'יש לי כאבי גב / פציעה / אני בהריון. אפשר להתאמן?',
    a: 'במקרים רבים פילאטיס מתאים מאוד — אבל חשוב לעדכן אותי מראש ולקבל אישור מגורם רפואי כשצריך, כדי שנתאים את האימון בדיוק אלייך או אליך.',
  },
  {
    q: 'מה צריך להביא לשיעור?',
    a: 'בגדים נוחים שמאפשרים תנועה, גרביים (עדיף עם סוליה מונעת החלקה) ובקבוק מים. את כל השאר תמצאו בסטודיו.',
  },
  {
    q: 'כמה פעמים בשבוע כדאי להתאמן?',
    a: 'פעמיים בשבוע זה מקום מצוין להתחיל בו. כבר אחרי כמה שבועות מרגישים את ההבדל ביציבה, בגמישות ובתחושה הכללית.',
  },
  {
    q: 'אפשר להזמין אותך לאירוע?',
    a: 'בהחלט — ערב נשים, יום גיבוש, יום הולדת או כל מפגש אחר. את הפרטים — מקום, מספר משתתפים ומה צריך להכין — נתאם יחד מראש.',
  },
  {
    q: 'איפה מתקיימים השיעורים?',
    a: 'אני מדריכה עצמאית ומגיעה לאן שצריך באזור עמק יזרעאל והסביבה — לסטודיו, למקום האירוע או אליכם. בנוסף אני מלמדת שיעורים קבוצתיים בסטודיו ״לעוף על הגוף״ בעין חרוד איחוד.',
  },
  {
    q: 'למי מיועד כלי בניית השיעורים?',
    a: 'למדריכות ומדריכי פילאטיס שרוצים לבנות שיעורים מסודרים, להתאים אותם למתאמנים עם פציעות או מצבים מיוחדים, ולהעביר אותם בקלות. הכלי הוא עזר מקצועי ואינו תחליף לייעוץ רפואי.',
  },
];

export const APP_PROMO = {
  title: 'כלים לבניית מערכי שיעור',
  text: 'מאגר של מאות תרגילים, בניית מערכי שיעור ומצב הדרכה חי — כלי עבודה למדריכות ומדריכי פילאטיס.',
  cta: 'לכלי בניית השיעורים',
  // Confirmed: the tool is meant for other instructors too, not only Rotem.
  navigationLabel: 'כלי בניית שיעורים',
};
