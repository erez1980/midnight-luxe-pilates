# Midnight Luxe Pilates

אפליקציית ווב לבניית שיעורי פילאטיס למדריכות — מאגר של 255 תרגילים מקצועיים, בניית מערכי שיעור, מצב הדרכה חי, שיתוף וסנכרון לענן.

**Stack:** React + TypeScript + Vite · Supabase (Auth + DB) · GitHub Pages (auto-deploy via Actions)

## הרצה מקומית

```bash
npm install
npm run dev
```

צור קובץ `.env` עם:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
(בלעדיהם האתר עובד במצב מקומי בלבד — בלי התחברות וסנכרון ענן.)

## פריסה

כל push ל-`main` בונה ופורס אוטומטית ל-GitHub Pages דרך `.github/workflows/deploy.yml`. ה-secrets `VITE_SUPABASE_URL` ו-`VITE_SUPABASE_ANON_KEY` מוגדרים ב-GitHub Actions.

## הגדרת Supabase

ראה `SUPABASE_SETUP.md` — כולל את כל ה-SQL (טבלאות lessons / lesson_templates / shared_lessons / profiles + RLS policies) והגדרת Google OAuth.
