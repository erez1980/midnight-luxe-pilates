# פילאטיס בתנועה

אתר התדמית של **פילאטיס בתנועה** (רתם), יחד עם אפליקציית בניית שיעורי הפילאטיס למדריכות.

| נתיב | מה יש שם | קוד |
|---|---|---|
| `/` | אתר תדמית: עמוד אחד עם הירו, על רתם, השיעורים, השיטה, מיקומים, שאלות נפוצות וצור קשר | `index.html`, `src/site/` |
| `/app/` | האפליקציה: מאגר תרגילים, בניית שיעורים, מצב הדרכה חי וסנכרון לענן | `app/index.html`, `src/App.tsx`, `src/components/` |

**Stack:** React + TypeScript + Vite (multi-page) · Tailwind v4 · Supabase (Auth + DB) · GitHub Pages (auto-deploy via Actions)

## עדכון תוכן האתר

כל התוכן של אתר התדמית נמצא בקובץ אחד: **`src/site/content.ts`**.
- `CONTACT`: ווטסאפ, טלפון, אינסטגרם ופייסבוק. שדה ריק מוסתר מהאתר. הכפתור הראשי עובד לפי סדר העדיפויות ווטסאפ ← טלפון ← מייל.
- `PHOTOS`: נתיב לתמונה בתוך `public/`, למשל `'photos/retem-hero.jpg'`. כל עוד הערך הוא `null` מוצג הלוגו במקום התמונה.
- `TESTIMONIALS`: המלצות. כל עוד הרשימה ריקה, הסקשן לא מוצג.
- הטקסטים של כל הסקשנים.

## מצבים מיוחדים (פציעות, הריון, אחרי לידה)

בכלי בניית השיעורים, כל תרגיל מקבל סימון לכל מצב: מתאים, בהתאמה או להימנע, עם הסיבה.
- `src/utils/conditions.ts`: רשימת המצבים וחוקי ה**טיוטה**. החוקים מזהים דפוסי תנועה לפי שם התרגיל, כמו היפוך, כפיפה תחת עומס או שכיבה על הבטן.
- `src/utils/conditionOverrides.ts`: ההחלטות שרתם אישרה. הן גוברות על הטיוטה ומוצגות באפליקציה כמאושרות.
- `docs/conditions-review.csv`: גיליון סקירה לכל התרגילים. לייצור מחדש: `npx tsx scripts/export-conditions-review.ts`.

הכלי הוא עזר למדריכות מוסמכות ואינו תחליף לייעוץ רפואי. ההסתייגות מוצגת בכל מקום שבו מופיעים הסימונים.

## קישורים ישנים

קישורי שיתוף שיעור (`?s=` / `?sharedLesson=`) והחזרות התחברות מ-Supabase שמגיעים לכתובת הראשית מועברים אוטומטית ל-`/app/`. ה-service worker הישן שישב בשורש האתר מבטל את עצמו, והאפליקציה רושמת worker חדש תחת `/app/`.

## הרצה מקומית

```bash
npm install
npm run dev   # האתר ב-http://localhost:3000/ והאפליקציה ב-http://localhost:3000/app/
```

לסנכרון ענן יוצרים קובץ `.env` עם:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## פריסה

כל push ל-`main` בונה ופורס אוטומטית ל-GitHub Pages דרך `.github/workflows/deploy.yml`.

> ב-Supabase צריך להוסיף את `https://erez1980.github.io/midnight-luxe-pilates/app/` תחת **Authentication → URL Configuration → Redirect URLs**, כדי שההתחברות עם Google תחזור ישירות לאפליקציה.

## הגדרת Supabase

ראו `SUPABASE_SETUP.md`.

## זהות עיצובית

`src/brand.css` מגדיר את אותם צבעים ופונטים לאתר הראשי ולאפליקציה: שנהב, מרווה וזהב, Heebo לטקסט ו־Frank Ruhl Libre לכותרות. האפליקציה מוצגת במצב בהיר ללא תלות בהעדפות המערכת.

[רשימת התוכן לרתם](docs/retem-content-request.md).
