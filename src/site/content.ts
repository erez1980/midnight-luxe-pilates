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
  instagram: '',
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
  { href: '#pricing', label: 'מחירים' },
  { href: '#method', label: 'השיטה' },
  { href: '#faq', label: 'שאלות נפוצות' },
  { href: '#contact', label: 'צרו קשר' },
];

export const HERO = {
  eyebrow: 'רתם · פילאטיס מזרן ומכשירים',
  title: ['תנועה', 'שמתחילה', 'מבפנים.'],
  subtitle:
    'שיעורי פילאטיס על מזרן ועל מכשירים — בקצב שלך, עם תשומת לב לנשימה, ליציבה ולגוף שלך. בלי מאמץ מיותר, עם הרבה כוונה.',
  highlights: ['הסמכה במזרן ובמכשירים', 'לכל גיל ולכל רמה', 'שיעור ניסיון ראשון ב-50 ₪'],
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
export const PRICING = {
  title: 'איך מתחילים?',
  intro: 'אפשר להתחיל בשיעור ניסיון, לבחור בשיעור פרטי מותאם אישית, או להצטרף לשיעור קבוצתי באחד הסטודיואים.',
  plans: [
    {
      id: 'trial',
      featured: true,
      name: 'שיעור ניסיון ראשון',
      price: '50 ₪',
      unit: '50 דקות',
      text: 'הדרך הכי טובה להכיר את השיטה, את הגוף שלך — ואותי.',
      points: ['שיעור מלא של 50 דקות', 'מתאים גם בלי שום ניסיון קודם'],
      cta: 'book' as const,
      ctaLabel: 'לתיאום שיעור ניסיון',
    },
    {
      id: 'private',
      featured: false,
      name: 'שיעור פרטי',
      price: '180 ₪',
      unit: 'לשיעור',
      text: 'שיעור אחד על אחד, שבנוי סביב הגוף, הקצב והמטרות שלך.',
      points: ['מזרן או מכשירים', 'בתיאום מראש ישירות מול רתם'],
      cta: 'book' as const,
      ctaLabel: 'לתיאום שיעור פרטי',
    },
    {
      id: 'group',
      featured: false,
      name: 'שיעור קבוצתי',
      price: 'לפי הסטודיו',
      unit: '',
      text: 'שיעורים קבוצתיים בסטודיואים שבהם אני מלמדת. המחיר נקבע לפי הסטודיו.',
      points: ['מזרן: עד 15 משתתפים', 'מכשירים: לפי מספר המכשירים בסטודיו', 'ההרשמה דרך מערכת השעות של הסטודיו'],
      cta: 'schedule' as const,
      ctaLabel: 'לבירור מיקומים ושעות',
    },
  ],
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

export const LOCATIONS = {
  title: 'איפה מתאמנים?',
  text: 'השיעורים הקבוצתיים מתקיימים בסטודיואים שונים, וההרשמה אליהם היא דרך מערכת השעות של כל סטודיו. שלחו לי הודעה ואשלח את המיקומים והשעות העדכניים. שיעורים פרטיים מתואמים ישירות איתי.',
  areas: [] as string[],
  studios: [] as { name: string; address: string; url?: string }[],
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
    q: 'כמה זה עולה?',
    a: 'שיעור ניסיון ראשון (50 דקות) עולה 50 ₪, ושיעור פרטי עולה 180 ₪. המחיר של שיעורים קבוצתיים נקבע לפי הסטודיו שבו מתקיים השיעור.',
  },
  {
    q: 'איך נרשמים לשיעור?',
    a: 'לשיעור ניסיון או לשיעור פרטי — שלחו לי הודעה בוואטסאפ ונתאם יחד מועד. לשיעורים קבוצתיים ההרשמה היא דרך מערכת השעות של הסטודיו, ואשמח לשלוח לכם את הפרטים.',
  },
];

export const APP_PROMO = {
  title: 'כלים לבניית מערכי שיעור',
  text: 'מאגר של מאות תרגילים, בניית מערכי שיעור ומצב הדרכה חי — כלי עבודה למדריכות ומדריכי פילאטיס.',
  cta: 'לכלי בניית השיעורים',
  // Update only after Retem confirms whether this is a personal or public tool.
  navigationLabel: 'כלי בניית שיעורים',
};
