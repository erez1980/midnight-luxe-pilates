import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { lesson, exercise } from '../fixtures';
import { changeCollection, emptyWorkspace, mergeRemote } from '../../src/utils/workspace';

// Local interaction tests must not wait for the external font service.
test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
});

const userId = '11111111-1111-4111-8111-111111111111';
async function account(page: Page, cloud: unknown[] = [], failPull = false) {
  const writes: { method: string; url: string; body: unknown }[] = [];
  let cloudRows = structuredClone(cloud) as { lesson_id: string; payload: unknown; updated_at: string }[];
  await page.addInitScript(({ userId }) => {
    const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'test@example.com', app_metadata: {}, user_metadata: { name: 'בדיקה' }, identities: [], created_at: '2026-01-01T00:00:00Z' };
    localStorage.setItem('sb-pilates-test-auth-token', JSON.stringify({ access_token: 'test-token', refresh_token: 'test-refresh', expires_at: 4102444800, expires_in: 3600, token_type: 'bearer', user }));
  }, { userId });
  await page.route('https://pilates-test.supabase.co/**', async (route) => {
    const request = route.request(); const url = request.url(); const method = request.method();
    if (url.includes('/auth/v1/user')) { await route.fulfill({ json: { id: userId, aud: 'authenticated', email: 'test@example.com', app_metadata: {}, user_metadata: { name: 'בדיקה' }, identities: [] } }); return; }
    const isLessonTable = /\/rest\/v1\/(lessons|lesson_templates)(\?|$)/.test(url);
    if (isLessonTable && method === 'GET') {
      if (failPull) await route.fulfill({ status: 403, json: { message: 'read denied' } });
      else await route.fulfill({ json: url.includes('/lesson_templates') ? [] : cloudRows });
      return;
    }
    if (isLessonTable && method !== 'GET') {
      const body = request.postDataJSON(); writes.push({ method, url, body });
      const params = new URL(url).searchParams;
      const id = body.lesson_id || params.get('lesson_id')?.replace(/^eq\./, '');
      const row = { lesson_id: id, payload: body.payload, updated_at: body.updated_at };
      if (!url.includes('/lesson_templates')) {
        const previous = cloudRows.find((item) => item.lesson_id === id);
        const expected = params.get('updated_at')?.replace(/^eq\./, '');
        if (method === 'PATCH' && previous?.updated_at !== expected) { await route.fulfill({ json: null }); return; }
        cloudRows = [row, ...cloudRows.filter((item) => item.lesson_id !== id)];
      }
      await route.fulfill({ json: { updated_at: body.updated_at } }); return;
    }
    if (url.includes('/rest/v1/profiles') && method === 'GET') { await route.fulfill({ json: { phone: '', studio_name: '', business_type: '', business_id: '', marketing_opt_in: false, onboarding_completed_at: null } }); return; }
    if (url.includes('/rest/v1/subscriptions') && method === 'GET') { await route.fulfill({ json: { plan: 'free', status: 'active' } }); return; }
    await route.fulfill({ status: 200, json: {} });
  });
  return writes;
}

test('mobile site has a bounded layout, honest scheduling CTA and accessible menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'לבקשת מערכת שעות ומיקום' })).toHaveAttribute('href', /^mailto:.*subject=/);
  await expect(page.locator('[data-mobile-book-bar]')).toHaveCount(0);
  const trigger = page.getByRole('button', { name: 'פתיחת התפריט' });
  await trigger.click();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => Boolean(document.activeElement?.closest('header')))).toBe(true); }
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
});

test('a new device reads cloud lessons before any write and does not open optional onboarding', async ({ page }) => {
  const writes = await account(page, [{ lesson_id: lesson.id, payload: lesson, updated_at: '2026-10-09T00:00:00+00:00' }]);
  await page.goto('/app/');
  await expect(page.getByRole('button', { name: 'השיעורים שלי (1)' })).toBeVisible();
  expect(writes).toEqual([]);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'השיעורים שלי (1)' }).click();
  await expect(page.getByText(lesson.name, { exact: true })).toBeVisible();
});

test('failed cloud reads never trigger writes or table-wide deletes', async ({ page }) => {
  const writes = await account(page, [], true);
  await page.goto('/app/');
  await expect(page.getByText('הסנכרון לא הושלם. אפשר לנסות שוב או להוריד גיבוי.')).toBeVisible();
  expect(writes).toEqual([]);
});

test('draft restores after reload, automatic build previews before replacing, and save is durable', async ({ page }) => {
  const writes = await account(page);
  await page.goto('/app/');
  await page.getByRole('button', { name: 'בניית שיעור חדש', exact: true }).click();
  await page.locator('#lesson-name').fill('טיוטת מבחן');
  await page.reload();
  await page.getByRole('button', { name: 'בניית שיעור חדש', exact: true }).click();
  await expect(page.locator('#lesson-name')).toHaveValue('טיוטת מבחן');
  await page.getByRole('button', { name: 'בניית שלד שיעור', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'תצוגה מקדימה של מערך אוטומטי' });
  await expect(preview).toBeVisible();
  await preview.getByRole('button', { name: 'אישור והחלפת המערך' }).click();
  await page.getByRole('button', { name: /שמירת.*שיעור|שמירה.*ספרייה/ }).click();
  await expect(page.getByRole('heading', { name: 'השיעורים שלי', exact: true })).toBeVisible();
  await expect.poll(() => writes.length).toBeGreaterThan(0);
  expect(writes.every((write) => write.method !== 'DELETE')).toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'השיעורים שלי (1)' })).toBeVisible();
});

test('manual coaching transitions start the new exercise at its own full duration', async ({ page }) => {
  const two = { ...lesson, exercises: [{ exercise, customDuration: 1 }, { exercise: { ...exercise, id: 'next', name: 'התרגיל הבא' }, customDuration: 5 }], totalDuration: 6 };
  await account(page, [{ lesson_id: lesson.id, payload: two, updated_at: '2026-10-09T00:00:00+00:00' }]);
  await page.goto('/app/');
  await page.getByRole('button', { name: 'השיעורים שלי (1)' }).click();
  await page.getByRole('button', { name: 'התחלת שיעור', exact: true }).click();
  await page.getByRole('button', { name: 'נגן', exact: true }).click();
  await page.getByRole('button', { name: 'לתרגיל הבא' }).click();
  await expect(page.getByText('05:00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'השהה', exact: true }).click();
  await expect(page.getByText('05:00', { exact: true })).toBeVisible();
});

test('exercise dialogs isolate focus and Escape returns to the trigger', async ({ page }) => {
  await page.goto('/app/');
  await page.getByRole('button', { name: 'למאגר התרגילים', exact: true }).click();
  const trigger = page.locator('main button:has(img)').first();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});


test('conflicting versions stay intact until the user chooses, then update uses the observed revision', async ({ page }) => {
  const v1 = '2026-10-09T00:00:00+00:00';
  const v2 = '2026-10-09T00:01:00+00:00';
  const baseline = mergeRemote(emptyWorkspace(), [{ collection: 'lessons', id: lesson.id, lesson, revision: v1, deleted: false }]).workspace;
  const local = changeCollection(baseline, 'lessons', [{ ...lesson, name: 'גרסה מקומית' }]);
  await page.addInitScript(({ local, userId }) => {
    if (!localStorage.getItem(`pilates:workspace:v3:${userId}`)) localStorage.setItem(`pilates:workspace:v3:${userId}`, JSON.stringify(local));
  }, { local, userId });
  const writes = await account(page, [{ lesson_id: lesson.id, payload: { ...lesson, name: 'גרסה מהענן' }, updated_at: v2 }]);
  await page.goto('/app/');
  await expect(page.getByText('נמצאו שינויים שונים במכשיר ובענן. שתי הגרסאות נשמרות עד לבחירה שלך.')).toBeVisible();
  expect(writes).toEqual([]);
  await page.getByRole('button', { name: 'להשתמש בגרסאות המקומיות' }).click();
  await expect(page.getByRole('dialog', { name: 'בחירת גרסה לסנכרון' })).toBeVisible();
  await page.getByRole('button', { name: 'אישור הבחירה' }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].method).toBe('PATCH');
  expect(new URL(writes[0].url).searchParams.get('updated_at')).toBe(`eq.${v2}`);
  expect((writes[0].body as { payload: { name: string } }).payload.name).toBe('גרסה מקומית');
});

test('deleting the last lesson remains empty after reload and sends a tombstone', async ({ page }) => {
  const writes = await account(page, [{ lesson_id: lesson.id, payload: lesson, updated_at: '2026-10-09T00:00:00+00:00' }]);
  await page.goto('/app/');
  await page.getByRole('button', { name: 'השיעורים שלי (1)' }).click();
  await page.getByRole('button', { name: `מחיקת ${lesson.name}` }).click();
  const dialog = page.getByRole('dialog', { name: 'מחיקת שיעור', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'מחקי שיעור' }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].method).toBe('PATCH');
  expect((writes[0].body as { payload: { _deleted: boolean } }).payload._deleted).toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'השיעורים שלי (0)' })).toBeVisible();
  await page.getByRole('button', { name: 'השיעורים שלי (0)' }).click();
  await expect(page.getByRole('heading', { name: 'לא נמצאו שיעורים שמורים' })).toBeVisible();
  expect(writes.length).toBe(1);
});

test('the application uses the main site brand even with a saved dark preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('pilates-theme-mode', 'dark'));
  await page.goto('/');
  const site = await page.evaluate(() => {
    const css = getComputedStyle(document.body);
    const heading = getComputedStyle(document.querySelector('h1')!);
    return { background: css.backgroundColor, text: css.color, font: css.fontFamily, headingFont: heading.fontFamily };
  });
  await page.goto('/app/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const css = getComputedStyle(document.body);
    const heading = getComputedStyle(document.querySelector('h1')!);
    return { background: css.backgroundColor, text: css.color, font: css.fontFamily, headingFont: heading.fontFamily };
  })).toEqual(site);
  const action = page.getByRole('button', { name: 'בניית שיעור חדש', exact: true });
  const buttonStyle = await action.evaluate((el) => ({ color: getComputedStyle(el).backgroundColor, radius: parseFloat(getComputedStyle(el).borderRadius) }));
  expect(buttonStyle.color).toBe('rgb(95, 113, 84)');
  expect(buttonStyle.radius).toBeGreaterThan(50);
  await page.screenshot({ path: 'test-results/app-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/app-mobile.png', fullPage: true });
});
