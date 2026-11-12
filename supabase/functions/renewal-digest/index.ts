// Edge Function: weekly email to Rotem with the clients whose health
// declaration expired (in the last 60 days) or expires within 30 days, each
// with a ready WhatsApp renewal message. Called by pg_cron (see
// supabase/migrations/20261112_renewal_digest.sql). Sends at most once every
// 6 days, so a stray public call can't spam her. Uses the same Resend secrets
// as `health-declaration`.

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Response | Promise<Response>): void };

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL') || 'rotem1980.shapira@gmail.com';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'פילאטיס בתנועה <onboarding@resend.dev>';

const FORM_LINK = 'https://rkpilatestudio.com/health/';
const CLIENTS_LINK = 'https://rkpilatestudio.com/app/?page=clients';
const DAY = 24 * 3600 * 1000;
const VALID_DAYS = 365;
const WARN_DAYS = 30;
const LOOKBACK_DAYS = 60; // older expiries stay visible in the app only
const MIN_GAP_DAYS = 6;

interface Client { full_name: string; phone: string; last_declaration_at: string }

async function rest(path: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (d: Date) => new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium', timeZone: 'Asia/Jerusalem' }).format(d);
const expiry = (c: Client) => new Date(new Date(c.last_declaration_at).getTime() + VALID_DAYS * DAY);

function renewLink(c: Client) {
  const first = c.full_name.trim().split(/\s+/)[0];
  const text = `היי ${first}, כאן רתם 💖\nעברה כמעט שנה מאז הצהרת הבריאות שלך, ואני צריכה אותה מעודכנת לפני האימונים הבאים. ממלאים כאן בכמה דקות:\n${FORM_LINK}\nתודה!`;
  return `https://wa.me/972${c.phone.replace(/^0/, '')}?text=${encodeURIComponent(text)}`;
}

Deno.serve(async () => {
  try {
    const [last] = await rest('renewal_digest_log?select=sent_at&order=sent_at.desc&limit=1');
    if (last && Date.now() - new Date(last.sent_at).getTime() < MIN_GAP_DAYS * DAY) {
      return Response.json({ skipped: 'sent recently' });
    }

    const now = Date.now();
    // Declared between (now - 365 - 60) and (now - 365 + 30) days ago.
    const from = new Date(now - (VALID_DAYS + LOOKBACK_DAYS) * DAY).toISOString();
    const to = new Date(now - (VALID_DAYS - WARN_DAYS) * DAY).toISOString();
    const clients: Client[] = await rest(
      `clients?select=full_name,phone,last_declaration_at&last_declaration_at=gte.${from}&last_declaration_at=lt.${to}&order=last_declaration_at.asc`
    );
    if (!clients.length) return Response.json({ skipped: 'nobody to renew' });
    if (!RESEND_API_KEY) return Response.json({ skipped: 'no RESEND_API_KEY' });

    const rows = clients
      .map((c) => {
        const e = expiry(c);
        const status = e.getTime() <= now ? `פגה ב-${fmt(e)}` : `בתוקף עד ${fmt(e)}`;
        return `<tr>
  <td style="padding:10px 0 10px 16px;border-bottom:1px solid #e4ddcd"><strong>${esc(c.full_name)}</strong><br><span style="color:#6b6f62;font-size:13px">${status}</span></td>
  <td style="padding:10px 0;border-bottom:1px solid #e4ddcd"><a href="${renewLink(c)}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:8px 14px;border-radius:999px;font-size:14px">שליחת בקשה בווטסאפ</a></td>
</tr>`;
      })
      .join('');
    const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;color:#2e3128;line-height:1.6">
  <h2 style="margin:0 0 8px">${clients.length === 1 ? 'לקוחה אחת צריכה' : `${clients.length} לקוחות צריכות`} לחדש הצהרת בריאות</h2>
  <p style="margin:0 0 16px;color:#6b6f62">הצהרת בריאות תקפה לשנה. אלה הלקוחות שההצהרה שלהן פגה או תפוג בחודש הקרוב. לחיצה על הכפתור פותחת הודעה מוכנה עם הקישור לטופס.</p>
  <table style="border-collapse:collapse;width:100%">${rows}</table>
  <p style="margin-top:20px;font-size:13px;color:#6b6f62">כל הלקוחות: ${CLIENTS_LINK}</p>
</div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFY_EMAIL],
        subject: `חידוש הצהרות בריאות: ${clients.length} ${clients.length === 1 ? 'לקוחה' : 'לקוחות'}`,
        html,
      }),
    });
    if (!res.ok) throw new Error(`resend: ${res.status} ${await res.text()}`);
    await rest('renewal_digest_log', { method: 'POST', body: JSON.stringify({ client_count: clients.length }) });
    return Response.json({ sent: clients.length });
  } catch (e) {
    console.error('renewal digest failed', e);
    return Response.json({ error: 'failed' }, { status: 500 });
  }
});
