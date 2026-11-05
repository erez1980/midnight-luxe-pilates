// Edge Function: receives the online health declaration from /health/,
// validates it, upserts the client (by phone) and stores the declaration,
// then emails Rotem a summary with the signature attached.
//
// Secrets (Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY  – from resend.com. Without it the declaration is still
//                     saved; only the email is skipped.
//   NOTIFY_EMAIL    – optional, defaults to Rotem's address.
//   FROM_EMAIL      – optional. Until rkpilatestudio.com is verified in Resend,
//                     keep the default (onboarding@resend.dev), which can only
//                     send to the email the Resend account was opened with.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
//
// Deployed with verify_jwt = false (supabase/config.toml): it is a public
// form, so the function does its own validation instead.

import {
  ANSWER_LABEL,
  FORM_VERSION,
  HEALTH_QUESTIONS,
  type Answer,
  type HealthSubmission,
  ageOn,
  digitsOnly,
  validateSubmission,
} from '../_shared/healthForm.ts';

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Response | Promise<Response>): void };

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL') || 'rotem1980.shapira@gmail.com';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'פילאטיס בתנועה <onboarding@resend.dev>';

const ALLOWED_ORIGINS = [
  'https://rkpilatestudio.com',
  'https://www.rkpilatestudio.com',
  'https://erez1980.github.io',
];

function cors(origin: string | null): Record<string, string> {
  const ok = origin && (ALLOWED_ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin));
  return {
    'Access-Control-Allow-Origin': ok ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    Vary: 'Origin',
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

async function rest(path: string, init: RequestInit & { prefer?: string }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function emailHtml(s: HealthSubmission, answers: { question: string; answer: Answer; details: string }[], age: number | null) {
  const flagged = answers.filter((a) => a.answer === 'yes');
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 0 4px 16px;color:#6b6f62;white-space:nowrap">${esc(label)}</td><td style="padding:4px 0">${esc(value)}</td></tr>`;
  return `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;color:#2e3128;line-height:1.6">
  <h2 style="margin:0 0 8px">הצהרת בריאות חדשה: ${esc(s.fullName.trim())}</h2>
  <p style="margin:0 0 16px;font-weight:bold;color:${flagged.length ? '#9a3412' : '#4c5c42'}">
    ${flagged.length ? `יש ${flagged.length} תשובות "כן" שכדאי לעבור עליהן לפני האימון.` : 'כל התשובות "לא". אין הערות בריאותיות.'}
  </p>
  <table style="border-collapse:collapse">
    ${row('טלפון', s.phone)}
    ${row('תאריך לידה', `${s.birthDate}${age !== null ? ` (גיל ${age})` : ''}`)}
    ${s.email.trim() ? row('מייל', s.email.trim()) : ''}
    ${row('איש קשר לחירום', `${s.emergencyName.trim()}, ${s.emergencyPhone}`)}
    ${s.guardianName.trim() ? row('הורה/אפוטרופוס', s.guardianName.trim()) : ''}
  </table>
  <h3 style="margin:20px 0 8px">התשובות</h3>
  <ol style="padding-right:20px;margin:0">
    ${answers
      .map(
        (a) => `<li style="margin-bottom:8px">${esc(a.question)}<br>
      <strong style="color:${a.answer === 'yes' ? '#9a3412' : '#2e3128'}">${ANSWER_LABEL[a.answer]}</strong>${a.details ? ` — ${esc(a.details)}` : ''}</li>`
      )
      .join('')}
  </ol>
  <p style="margin-top:20px;color:#6b6f62;font-size:13px">ההצהרה והחתימה (מצורפת) נשמרו ברשומת הלקוח. אפשר לראות את כל הלקוחות באפליקציה: https://rkpilatestudio.com/app/?page=clients</p>
</div>`;
}

Deno.serve(async (req) => {
  const headers = cors(req.headers.get('Origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return json({ error: 'method' }, 405, headers);

  let s: HealthSubmission;
  try {
    s = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400, headers);
  }
  // Bots fill every field; pretend it worked so they don't retry.
  if (s?.website) return json({ ok: true }, 200, headers);

  const errors = validateSubmission(s);
  if (Object.keys(errors).length) return json({ error: 'invalid', fields: errors }, 422, headers);

  const age = ageOn(s.birthDate);
  const answers = HEALTH_QUESTIONS.map((q) => {
    const a = s.answers[q.id];
    return { id: q.id, question: q.text, answer: a.answer as Answer, details: a.answer === 'yes' ? a.details.trim() : '' };
  });

  try {
    // Client + declaration in one transaction (public.submit_health_declaration).
    await rest('rpc/submit_health_declaration', {
      method: 'POST',
      body: JSON.stringify({
        p: {
          phone: digitsOnly(s.phone),
          personal: {
            full_name: s.fullName.trim(),
            birth_date: s.birthDate,
            email: s.email.trim(),
            emergency_name: s.emergencyName.trim(),
            emergency_phone: digitsOnly(s.emergencyPhone),
          },
          form_version: FORM_VERSION,
          answers,
          has_flags: answers.some((a) => a.answer === 'yes'),
          guardian_name: s.guardianName.trim(),
          signature_png: s.signature,
          user_agent: (req.headers.get('User-Agent') || '').slice(0, 300),
        },
      }),
    });
  } catch (e) {
    console.error('save failed', e);
    return json({ error: 'save_failed' }, 500, headers);
  }

  // The declaration is saved; an email failure must not fail the submission.
  let emailed = false;
  if (RESEND_API_KEY) {
    try {
      const flagged = answers.some((a) => a.answer === 'yes');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [NOTIFY_EMAIL],
          ...(s.email.trim() ? { reply_to: s.email.trim() } : {}),
          subject: `${flagged ? '⚠️ ' : ''}הצהרת בריאות: ${s.fullName.trim()}`,
          html: emailHtml(s, answers, age),
          attachments: [
            { filename: `signature-${digitsOnly(s.phone)}.png`, content: s.signature.replace(/^data:image\/png;base64,/, '') },
          ],
        }),
      });
      emailed = res.ok;
      if (!res.ok) console.error('email failed', res.status, await res.text());
    } catch (e) {
      console.error('email failed', e);
    }
  }

  return json({ ok: true, emailed }, 200, headers);
});
