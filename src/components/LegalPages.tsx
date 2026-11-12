import React from 'react';
import { ArrowRight } from 'lucide-react';

const LAST_UPDATED = '12.11.2026';
const CONTACT_EMAIL = 'rotem1980.shapira@gmail.com';
const GOOGLE_DATA_EMAIL = 'erez1980@gmail.com';
const SERVICE_NAME = 'פילאטיס בתנועה';
const LEGAL_NAME = 'RK Pilates Studio';

export const LEGAL_LAST_UPDATED = LAST_UPDATED;

export function LegalNotice() {
  return (
    <>
      המסמכים בעמוד זה נכתבו כדי לתאר בשקיפות איך {SERVICE_NAME} פועל, ואינם ייעוץ משפטי. מומלץ להיוועץ בעורך/ת דין לפני שימוש מסחרי או הרחבת השירות (למשל לקראת גביית תשלום).
    </>
  );
}

function LegalShell({
  title,
  onBack,
  children
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-secondary hover:text-on-surface transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        חזרה
      </button>

      <div className="mb-10">
        <div className="inline-block mb-3 px-4 py-1 border-l border-r border-secondary/40">
          <span className="tracking-[0.2em] text-secondary text-xs font-semibold">{SERVICE_NAME}</span>
        </div>
        <h1 className="serif-text text-3xl md:text-4xl font-bold text-on-surface mb-2">{title}</h1>
        <p className="text-xs text-on-surface-variant">עודכן לאחרונה: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-sm md:text-base text-on-surface-variant leading-relaxed [&_h2]:serif-text [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:font-bold [&_h2]:text-on-surface [&_h2]:mb-3 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pr-5 [&_p+p]:mt-3">
        {children}
      </div>

      <div className="mt-12 rounded-2xl border border-outline/20 bg-surface-container p-5 text-xs text-on-surface-variant leading-relaxed">
        <LegalNotice />
      </div>
    </div>
  );
}

export function PrivacyPolicyBody() {
  return (
    <>
      <section>
        <h2>1. כללי</h2>
        <p>
          מדיניות זו חלה על {LEGAL_NAME} ({SERVICE_NAME}, https://rkpilatestudio.com) ומסבירה איזה מידע האתר אוסף, איך הוא נשמר ולשם מה הוא משמש. השימוש באתר מהווה הסכמה למדיניות זו.
          השירות מיועד למדריכות ומדריכי פילאטיס לצורך בניית שיעורים וניהול מאגר עבודה אישי, וכן מציג את שיעורי הפילאטיס של רתם שפירא. הוא אינו מיועד לילדים ולקטינים. הצהרת בריאות של מתאמן/ת מתחת לגיל 18 נחתמת על ידי הורה או אפוטרופוס.
        </p>
      </section>

      <section>
        <h2>2. איזה מידע נאסף</h2>
        <ul>
          <li><strong>פרטי התחברות דרך Google</strong> — שם, כתובת אימייל ותמונת פרופיל, המתקבלים מ-Google בעת התחברות (Google OAuth). הסיסמה עצמה אינה נחשפת לאתר בשום שלב.</li>
          <li><strong>פרטי פרופיל עסקיים (אופציונלי)</strong> — טלפון, שם סטודיו/עסק, סוג עוסק ומספר עוסק, הנמסרים מרצון בטופס השלמת הפרופיל, לצורך ניהול החשבון ולצורך הפקת חשבוניות אם וכאשר יופעל מודל בתשלום. בנוסף נשמרת בחירתך אם להסכים לקבלת עדכונים במייל (ניתנת לביטול בכל עת).</li>
          <li><strong>מערכי שיעור ותבניות</strong> — השיעורים, התרגילים והדגשים שנוצרים ונשמרים בעת השימוש ב-builder.</li>
          <li><strong>מידע מקומי במכשיר</strong> — שיעורים וטיוטות נשמרים גם ב-localStorage של הדפדפן, כדי שהאתר יעבוד גם במצב אורח (ללא התחברות) וללא תלות ברשת.</li>
          <li><strong>קישורי שיתוף</strong> — כשנוצר קישור שיתוף לשיעור, תוכן השיעור נשמר לצורך הצגתו למי שמחזיק בקישור.</li>
          <li><strong>הצהרת בריאות (מידע רגיש)</strong> — מי שמתאמן/ת אצל רתם ממלא/ת הצהרת בריאות בעמוד /health/: שם, תאריך לידה, טלפון, מייל (לא חובה), איש קשר לחירום, תשובות לשאלות בריאות, חתימה, ובקטינים גם שם ההורה החותם. המידע נמסר מרצון ובהסכמה מפורשת, ומשמש רק להתאמת האימון ולבטיחותו.</li>
          <li><strong>נתוני שימוש סטטיסטיים</strong> — האתר משתמש ב-Google Analytics כדי להבין אילו עמודים נצפים, מאיזה סוג מכשיר ומאיזה אזור כללי, וכמה פניות יוצאות מהאתר (למשל לחיצה על וואטסאפ או שליחת טופס הזמנה). נאסף מידע כללי בלבד, באמצעות עוגיות. תוכן ההודעות, שמות ופרטי קשר שמוזנים בטפסים אינם נשלחים ל-Google Analytics.</li>
        </ul>
        <p>האתר אינו אוסף פרטי תשלום, מכיוון שאין כרגע תשלום עבור השימוש בשירות.</p>
      </section>

      <section>
        <h2>3. איך המידע נשמר</h2>
        <p>
          מידע של משתמשות ומשתמשים מחוברים נשמר בענן דרך <strong>Supabase</strong> (ספק תשתית לאחסון נתונים ואימות), באזור eu-central-1 באיחוד האירופי (פרנקפורט), עם הרשאות גישה ברמת שורה (Row Level Security) — כל אדם רואה ויכול לערוך רק את הנתונים שלו/שלה. קישורי שיתוף ציבוריים הם היוצא מהכלל: כל מי שמחזיק בקישור יכול לצפות בשיעור המשותף, גם ללא התחברות.
        </p>
        <p>
          הצהרות בריאות נשמרות ב-Supabase (אזור eu-central-1 באיחוד האירופי) בטבלה נפרדת שהגישה אליה חסומה לציבור. רק רתם (ומנהל האתר, לצורך תחזוקה) יכולים לצפות בהן, אחרי התחברות. עותק של ההצהרה נשלח גם למייל של רתם. הדפדפן של הממלא/ת אינו שומר את התשובות אחרי השליחה.
        </p>
        <p>
          מידע במצב אורח (ללא התחברות) נשמר רק בדפדפן המקומי של המכשיר, ואינו מועבר לשרת כלל.
        </p>
      </section>

      <section>
        <h2>4. שימוש במידע</h2>
        <p>המידע משמש אך ורק כדי:</p>
        <ul>
          <li>לאפשר התחברות וזיהוי בין מכשירים.</li>
          <li>לשמור ולסנכרן מערכי שיעור, תבניות וספריית עבודה אישית.</li>
          <li>להציג שיעורים ששותפו לצד שלישי דרך קישור.</li>
        </ul>
        <p>המידע אינו נמכר, אינו מושכר ואינו מועבר לצדדים שלישיים למטרות פרסום או שיווק.</p>
      </section>

      <section>
        <h2>5. שירותי צד שלישי</h2>
        <p>
          השירות מסתמך על <strong>Google</strong> (לצורך התחברות), על <strong>Supabase</strong> (לצורך אחסון וסנכרון), על <strong>Resend</strong> (לשליחת הצהרות הבריאות למייל של רתם) ועל <strong>Google Analytics</strong> (לצורך סטטיסטיקת שימוש). לספקים אלה מדיניות פרטיות עצמאית משלהם החלה על עיבוד המידע אצלם.
        </p>
        <p>
          ניתן לחסום את איסוף הנתונים של Google Analytics באמצעות הגדרות העוגיות בדפדפן, או באמצעות{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">התוסף של Google לביטול Google Analytics</a>.
        </p>
      </section>

      <section>
        <h2>6. מידע מחשבון Google</h2>
        <p>
          ההתחברות לאתר, בעיקר לכלי בניית השיעורים, מתבצעת באמצעות Google Identity Services או Google OAuth, ומועברת ל-Supabase לצורך יצירת חשבון והתחברות. האתר מבקש רק את ההרשאות openid, email ו-profile. הוא אינו מבקש גישה ל-Gmail, ל-Google Drive, ליומן או לנתוני Google אחרים.
        </p>
        <p>
          מהחשבון מתקבלים שם התצוגה, כתובת הדוא"ל ותמונת הפרופיל. הם משמשים רק ליצירת החשבון ולהתחברות, ולהצגת השם והתמונה בפרופיל ובממשק האתר. האתר אינו משתמש במידע מ-Google לפרסום, אינו מוכר אותו, ואינו משתף אותו עם צדדים שלישיים — למעט ספקי השירות הנחוצים להפעלת האתר (Supabase לאחסון נתוני החשבון וההתחברות באזור eu-central-1).
        </p>
        <p>
          שימוש האתר במידע שמתקבל מממשקי Google API, והעברתו ליישום אחר אם תידרש, יעמדו במדיניות נתוני המשתמש של שירותי Google API, לרבות דרישות השימוש המוגבל (Google API Services User Data Policy, Limited Use).
        </p>
      </section>

      <section>
        <h2>7. עוגיות, הפעלה (session) ושמירה בדפדפן</h2>
        <p>
          לאחר התחברות עם Google, ה-session נשמר בדפדפן (ב-localStorage, דרך לקוח Supabase) כדי שתישארו מחוברים בין ביקורים, עד שתתנתקו או עד שפג תוקף ההפעלה. שיעורים וטיוטות במצב אורח נשמרים גם הם ב-localStorage של הדפדפן, ואינם מועברים לשרת.
        </p>
        <p>
          Google Analytics שומר עוגייה עם מזהה אקראי כדי להבחין בין ביקור חוזר לביקור חדש, ואינו מקושר לחשבון המשתמש ואינו משמש לפרסום. ניתן לחסום אותה בהגדרות הדפדפן או בתוסף ביטול ההצטרפות של Google Analytics.
        </p>
      </section>

      <section>
        <h2>8. זכויות המשתמש/ת</h2>
        <p>
          ניתן בכל עת לבקש עיון, תיקון או מחיקה מלאה של המידע השמור בחשבון — כולל שיעורים, תבניות, פרטי הפרופיל, נתוני התחברות מ-Google והצהרות בריאות — על ידי פנייה ל-<a className="text-secondary hover:underline" href={`mailto:${GOOGLE_DATA_EMAIL}`}>{GOOGLE_DATA_EMAIL}</a>. מחיקת חשבון היא בלתי הפיכה.
        </p>
      </section>

      <section>
        <h2>9. אבטחת מידע</h2>
        <p>
          ננקטים אמצעי אבטחה סבירים (הצפנת תעבורה, הרשאות גישה מבוססות משתמש) כדי להגן על המידע, אך כמו בכל שירות מקוון, לא ניתן להבטיח הגנה מוחלטת מפני כל תרחיש.
        </p>
      </section>

      <section>
        <h2>10. שינויים במדיניות</h2>
        <p>
          מדיניות זו עשויה להתעדכן מעת לעת. תאריך העדכון האחרון מופיע בראש העמוד. המשך שימוש באתר לאחר עדכון מהווה הסכמה למדיניות המעודכנת.
        </p>
      </section>

      <section>
        <h2>11. יצירת קשר</h2>
        <p>
          לבקשות עיון, תיקון או מחיקה של חשבון ושל מידע שהתקבל מ-Google: <a className="text-secondary hover:underline" href={`mailto:${GOOGLE_DATA_EMAIL}`}>{GOOGLE_DATA_EMAIL}</a>.
          לשאלות אחרות, כולל הצהרות בריאות: <a className="text-secondary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section lang="en" dir="ltr">
        <h2>Privacy (English)</h2>
        <p>
          {LEGAL_NAME} ({SERVICE_NAME}, https://rkpilatestudio.com) is Rotem Shapira’s site for mat and apparatus Pilates classes in the Emek Izrael Valley and northern Israel, and a lesson-planning tool for Pilates instructors. You can browse the public site without an account. Signing in uses Google Identity Services or Google OAuth, and is completed through Supabase to create and access an instructor account.
        </p>
        <p>
          We request only the openid, email, and profile scopes. We do not request Gmail, Google Drive, Calendar, or other Google data. From Google we receive your name, email address, and profile picture. We use this only to create and sign in to your account and to show your display name and photo in the app. We do not use Google user data for advertising, do not sell it, and do not share it except with service providers that operate the service: Supabase (authentication and account data, stored in AWS region eu-central-1 in the EU).
        </p>
        <p>
          {LEGAL_NAME}'s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
        </p>
        <p>
          After you sign in, the session is stored in your browser (localStorage via the Supabase client) until you sign out or the session expires. Lesson drafts in guest mode stay in localStorage only and are not sent to the server. Google Analytics may set a cookie with a random identifier to distinguish returning visits; this is not linked to your account and is not used for advertising.
        </p>
        <p>
          To request access, correction, or deletion of your account and Google account data, email <a className="text-secondary hover:underline" href={`mailto:${GOOGLE_DATA_EMAIL}`}>{GOOGLE_DATA_EMAIL}</a>. For other questions, including health-declaration inquiries, email <a className="text-secondary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. This policy was last updated on 12.11.2026.
        </p>
      </section>
    </>
  );
}

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <LegalShell title="מדיניות פרטיות" onBack={onBack}>
      <PrivacyPolicyBody />
    </LegalShell>
  );
}

export function TermsOfUseBody() {
  return (
    <>
      <section>
        <h2>1. הסכמה לתנאים</h2>
        <p>
          הגלישה והשימוש ב-{SERVICE_NAME} מהווים הסכמה לתנאי שימוש אלו. מי שאינו מסכים לתנאים מתבקש/ת להימנע משימוש בשירות.
        </p>
      </section>

      <section>
        <h2>2. מהות השירות</h2>
        <p>
          {SERVICE_NAME} הוא כלי עבודה למדריכות ומדריכי פילאטיס: מאגר תרגילים, בניית מערכי שיעור, ספריית שיעורים אישית, שיתוף מערכים ומצב הדרכה חי בזמן אימון. השירות ניתן כיום ללא תשלום. אין בכך התחייבות שהשירות יישאר חינמי לצמיתות — כל שינוי עתידי במודל התשלום יפורסם מראש.
        </p>
      </section>

      <section>
        <h2>3. הרשמה וחשבון</h2>
        <p>
          חלק מהתכונות (builder, ספריית שיעורים, סנכרון בין מכשירים) דורשות התחברות באמצעות חשבון Google. האחריות לשמירה על אבטחת חשבון ה-Google שלך, ולכל פעולה שתתבצע דרכו בשירות, חלה על המשתמש/ת.
        </p>
      </section>

      <section>
        <h2>4. תוכן שנוצר על ידי המשתמש</h2>
        <p>
          מערכי השיעור, התבניות וההערות שאת/ה יוצר/ת נשארים בבעלותך. בשימוש בשירות את/ה מעניק/ה ל-{SERVICE_NAME} רישיון מוגבל לאחסן, לסנכרן ולהציג את התוכן הזה בחזרה אליך — ולצד שלישי, במקרים בהם את/ה יוזם/ת שיתוף מפורש (למשל דרך קישור שיתוף).
        </p>
      </section>

      <section>
        <h2>5. שיתוף שיעורים</h2>
        <p>
          קישור שיתוף שנוצר לשיעור הוא <strong>ציבורי</strong> — כל מי שמחזיק בקישור יכול לצפות בתוכן השיעור, גם ללא התחברות לשירות. האחריות על החלטה למי לשלוח קישור כזה חלה על המשתמש/ת שיצר/ה אותו.
        </p>
      </section>

      <section>
        <h2>6. תוכן ההדרכה במאגר התרגילים</h2>
        <p>
          התרגילים, ההנחיות ודגשי הביצוע המוצגים במאגר הם חומר עזר כללי להדרכה מקצועית, ואינם תחליף להכשרה מקצועית, לייעוץ רפואי או להתאמה אישית של תרגיל למתאמן/ת ספציפי/ת. האחריות המקצועית להתאמת תרגיל, רמת קושי ובטיחות המתאמנים חלה במלואה על המדריך/ה המשתמש/ת בשירות.
        </p>
      </section>

      <section>
        <h2>7. קניין רוחני</h2>
        <p>
          העיצוב, הקוד, הלוגו ומאגר התרגילים המובנה (למעט תוכן שהמשתמש/ת יצר/ה בעצמו/ה) שייכים למפעילי {SERVICE_NAME}. אין להעתיק, לשכפל או להפיץ מחדש חלקים מהשירות למטרות מסחריות ללא אישור מראש.
        </p>
      </section>

      <section>
        <h2>8. הגבלת אחריות</h2>
        <p>
          השירות ניתן "כפי שהוא" (AS IS), ללא התחייבות לזמינות רצופה או ללא תקלות. איננו אחראים לאובדן נתונים, נזק עקיף, או הפסקת שירות זמנית או קבועה. מומלץ לגבות מערכי שיעור חשובים (דרך אפשרות הגיבוי לקובץ באתר) בנוסף לסנכרון בענן.
        </p>
      </section>

      <section>
        <h2>9. שינויים והפסקת שירות</h2>
        <p>
          אנו רשאים לעדכן, לשנות תכונות, או להפסיק את השירות כולו או חלקו, בכל עת ובהודעה מוקדמת סבירה ככל שניתן.
        </p>
      </section>

      <section>
        <h2>10. דין חל</h2>
        <p>על תנאים אלו יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים בישראל.</p>
      </section>

      <section>
        <h2>11. יצירת קשר</h2>
        <p>
          לשאלות בנוגע לתנאי השימוש: <a className="text-secondary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </>
  );
}

export function TermsOfUse({ onBack }: { onBack: () => void }) {
  return (
    <LegalShell title="תנאי שימוש" onBack={onBack}>
      <TermsOfUseBody />
    </LegalShell>
  );
}
