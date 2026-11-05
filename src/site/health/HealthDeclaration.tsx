import React, { useEffect, useRef, useState } from 'react';
import { CONTACT } from '../content';
import {
  ANSWER_LABEL,
  DECLARATION_PARAGRAPHS,
  DECLARATION_TITLE,
  HEALTH_QUESTIONS,
  MAX_TEXT,
  type Answer,
  type HealthSubmission,
  ageOn,
  validateSubmission,
} from '../../../supabase/functions/_shared/healthForm';

// Online health declaration (/health/). Rotem sends the link to a new client
// before the first lesson. The submission goes to the `health-declaration`
// Edge Function, which stores it as a client record and emails Rotem. Nothing
// is kept in the browser: health data should not linger on a shared phone.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const ENDPOINT = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/health-declaration` : '';

const todayLabel = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
const todayIso = new Date().toISOString().slice(0, 10);

const field =
  'mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 aria-[invalid=true]:border-red-700';

const emptySubmission = (): HealthSubmission => ({
  fullName: '',
  birthDate: '',
  phone: '',
  email: '',
  emergencyName: '',
  emergencyPhone: '',
  answers: Object.fromEntries(HEALTH_QUESTIONS.map((q) => [q.id, { answer: '', details: '' }])),
  guardianName: '',
  signature: '',
  consentDeclaration: false,
  consentPrivacy: false,
  website: '',
});

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
      {message}
    </p>
  );
}

// Finger / mouse signature on a canvas. Reports a PNG data URL, or '' when cleared.
function SignaturePad({ onChange, invalid }: { onChange: (png: string) => void; invalid: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = canvas.current!;
    const size = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = c.getBoundingClientRect();
      // Resizing clears the canvas, so only do it when the width really changed.
      if (c.width === Math.round(rect.width * ratio)) return;
      // Resizing wipes the canvas (e.g. turning the phone), so keep a copy of
      // what was already signed and paint it back, scaled to the new size.
      const copy = document.createElement('canvas');
      copy.width = c.width;
      copy.height = c.height;
      if (c.width) copy.getContext('2d')!.drawImage(c, 0, 0);
      c.width = Math.round(rect.width * ratio);
      c.height = Math.round(rect.height * ratio);
      const ctx = c.getContext('2d')!;
      if (copy.width) ctx.drawImage(copy, 0, 0, c.width, c.height);
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2e3128';
    };
    size();
    window.addEventListener('resize', size);
    return () => window.removeEventListener('resize', size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const point = (e: React.PointerEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    canvas.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const ctx = canvas.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#2e3128';
    ctx.fill();
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const p = point(e);
    const ctx = canvas.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    setEmpty(false);
    onChange(canvas.current!.toDataURL('image/png'));
  };
  const clear = () => {
    const c = canvas.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    onChange('');
  };

  return (
    <div>
      <div className={`relative rounded-2xl border bg-white ${invalid ? 'border-red-700' : 'border-line'}`}>
        <canvas
          ref={canvas}
          role="img"
          aria-label="תיבת חתימה: חתמו כאן באצבע או בעכבר"
          className="block h-44 w-full cursor-crosshair touch-none rounded-2xl"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted/70">
            חתמו כאן באצבע
          </span>
        )}
        <span className="pointer-events-none absolute bottom-10 left-6 right-6 border-b border-dashed border-line" />
      </div>
      <button type="button" onClick={clear} className="mt-2 text-sm text-sage underline underline-offset-4 hover:text-sage-deep">
        ניקוי החתימה
      </button>
    </div>
  );
}

export default function HealthDeclaration({ root }: { root: string }) {
  const [form, setForm] = useState<HealthSubmission>(emptySubmission);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false); // tried at least once: validate live
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const [hadFlags, setHadFlags] = useState(false);

  const set = <K extends keyof HealthSubmission>(key: K, value: HealthSubmission[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setAnswer = (id: string, patch: Partial<{ answer: Answer; details: string }>) =>
    setForm((f) => ({ ...f, answers: { ...f.answers, [id]: { ...f.answers[id], ...patch } } }));

  useEffect(() => {
    if (submitted) setErrors(validateSubmission(form));
  }, [form, submitted]);

  const age = ageOn(form.birthDate);
  const minor = age !== null && age < 18;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateSubmission(form);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (document.getElementById(first) as HTMLElement | null)?.focus?.({ preventScroll: true });
      return;
    }
    if (!ENDPOINT) {
      setStatus('failed');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}) },
        body: JSON.stringify(form),
      });
      if (res.status === 422) {
        const body = await res.json().catch(() => ({}));
        setErrors(body.fields || {});
        setStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setHadFlags(Object.values(form.answers).some((a) => a.answer === 'yes'));
      setStatus('done');
      // Conversion only: no form contents go to analytics.
      window.gtag?.('event', 'health_declaration_submit');
      // Drop the health data from memory once it is saved.
      setForm(emptySubmission());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('failed');
    }
  };

  const textInput = (
    id: keyof HealthSubmission,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    optional = false
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {optional ? <span className="font-normal text-muted"> (לא חובה)</span> : <span className="text-gold-deep"> *</span>}
      </label>
      <input
        id={id}
        className={field}
        value={form[id] as string}
        onChange={(e) => set(id, e.target.value as never)}
        aria-invalid={Boolean(errors[id])}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
        required={!optional}
        {...props}
      />
      <FieldError id={id} message={errors[id]} />
    </div>
  );

  return (
    <div className="min-h-screen bg-sand/60 px-4 pb-16 pt-6 sm:px-6">
      <header className="mx-auto flex max-w-2xl items-center justify-between">
        <a href={root} className="flex items-center gap-2.5">
          <img src={`${root}brand/emblem-light.webp`} alt="" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold tracking-wide text-gold-deep">פילאטיס בתנועה</span>
        </a>
        <span className="text-sm text-muted">{todayLabel}</span>
      </header>

      <main className="mx-auto mt-6 max-w-2xl">
        {status === 'done' ? (
          <section className="rounded-[28px] border border-line bg-ivory p-6 text-center md:p-10" aria-live="polite">
            <p className="text-4xl" aria-hidden="true">💖</p>
            <h1 className="mt-3 font-display text-3xl">תודה, ההצהרה התקבלה</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {hadFlags
                ? 'רתם תעבור על מה שכתבת ותתאים את האימון בשבילך. אם צריך, היא תיצור איתך קשר לפני שנפגשות.'
                : 'הכול מוכן. נתראה באימון!'}
            </p>
            <p className="mt-6 text-sm text-muted">אם משהו במצב הבריאותי משתנה, חשוב לעדכן את רתם לפני האימון.</p>
            <a href={root} className="mt-8 inline-flex rounded-full bg-sage px-7 py-3 font-medium text-white hover:bg-sage-deep">
              לאתר של רתם
            </a>
          </section>
        ) : (
          <form onSubmit={onSubmit} noValidate className="rounded-[28px] border border-line bg-ivory p-5 sm:p-8 md:p-10">
            <h1 className="font-display text-3xl md:text-4xl">הצהרת בריאות</h1>
            <p className="mt-3 text-lg leading-relaxed text-muted">
              היוששש, איזה כיף שנרשמת לאימון! רגע לפני שאנחנו נפגשות אצטרך שתמלאי הצהרת בריאות 💖
            </p>
            <p className="mt-2 text-sm text-muted">
              ההצהרה אישית, נשמרת אצל רתם בלבד ולא מועברת לאף אחד אחר. לוקח בערך 3 דקות.
            </p>

            {/* Honeypot for bots. Hidden from people and screen readers. */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                אתר
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
              </label>
            </div>

            <fieldset className="mt-8">
              <legend className="font-display text-xl">פרטים אישיים</legend>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {textInput('fullName', 'שם מלא', { autoComplete: 'name' })}
                {textInput('birthDate', 'תאריך לידה', { type: 'date', max: todayIso, min: '1915-01-01' })}
                {textInput('phone', 'טלפון', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', dir: 'ltr', placeholder: '050-1234567', className: `${field} text-right` })}
                {textInput('email', 'מייל', { type: 'email', inputMode: 'email', autoComplete: 'email', dir: 'ltr', className: `${field} text-right` }, true)}
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <legend className="font-display text-xl">איש/אשת קשר למקרה חירום</legend>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {textInput('emergencyName', 'שם', { autoComplete: 'off' })}
                {textInput('emergencyPhone', 'טלפון', { type: 'tel', inputMode: 'tel', autoComplete: 'off', dir: 'ltr', placeholder: '050-1234567', className: `${field} text-right` })}
              </div>
            </fieldset>

            <section className="mt-10" aria-labelledby="health-questions">
              <h2 id="health-questions" className="font-display text-xl">שאלות בריאות</h2>
              <p className="mt-1 text-sm text-muted">על כל &quot;כן&quot; נבקש לפרט בכמה מילים, כדי שרתם תוכל להתאים את האימון.</p>
              <ol className="mt-5 space-y-4">
                {HEALTH_QUESTIONS.map((q, i) => {
                  const a = form.answers[q.id];
                  const err = errors[`q_${q.id}`];
                  const options: Answer[] = q.allowNotRelevant ? ['yes', 'no', 'na'] : ['yes', 'no'];
                  return (
                    <li key={q.id}>
                      <fieldset
                        id={`q_${q.id}`}
                        tabIndex={-1}
                        className={`rounded-2xl border bg-white/70 p-4 sm:p-5 ${err ? 'border-red-700' : 'border-line'}`}
                        aria-describedby={err ? `q_${q.id}-error` : undefined}
                      >
                        <legend className="sr-only">{q.text}</legend>
                        <p className="font-medium leading-relaxed" aria-hidden="true">
                          <span className="text-gold-deep">{i + 1}.</span> {q.text}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {options.map((opt) => (
                            <label
                              key={opt}
                              className={`min-w-20 cursor-pointer rounded-full border px-5 py-2.5 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                                a.answer === opt
                                  ? opt === 'yes'
                                    ? 'border-gold-deep bg-gold-soft text-ink'
                                    : 'border-sage bg-sage text-white'
                                  : 'border-line text-muted hover:border-sage hover:text-sage'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                value={opt}
                                checked={a.answer === opt}
                                onChange={() => setAnswer(q.id, { answer: opt })}
                                className="sr-only"
                              />
                              {ANSWER_LABEL[opt]}
                            </label>
                          ))}
                        </div>
                        {a.answer === 'yes' && (
                          <label className="mt-4 block text-sm font-medium text-ink">
                            {q.detailsLabel}
                            <textarea
                              className={`${field} min-h-20 resize-y`}
                              value={a.details}
                              maxLength={MAX_TEXT}
                              onChange={(e) => setAnswer(q.id, { details: e.target.value })}
                              aria-invalid={Boolean(err)}
                            />
                          </label>
                        )}
                        <FieldError id={`q_${q.id}`} message={err} />
                      </fieldset>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="mt-10 rounded-2xl border border-line bg-sage-soft/60 p-5 sm:p-6" aria-labelledby="declaration">
              <h2 id="declaration" className="font-display text-xl">{DECLARATION_TITLE}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/90">
                {DECLARATION_PARAGRAPHS.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>

            {minor && (
              <div className="mt-6">
                {textInput('guardianName', 'שם ההורה או האפוטרופוס החותם/ת (מתחת לגיל 18)', { autoComplete: 'off' })}
              </div>
            )}

            <div className="mt-6" id="signature" tabIndex={-1}>
              <p className="text-sm font-medium text-ink">
                {minor ? 'חתימת ההורה או האפוטרופוס' : 'חתימה'}
                <span className="text-gold-deep"> *</span>
              </p>
              <div className="mt-2">
                <SignaturePad onChange={(png) => set('signature', png)} invalid={Boolean(errors.signature)} />
              </div>
              <FieldError id="signature" message={errors.signature} />
            </div>

            <div className="mt-6 space-y-4">
              {(
                [
                  ['consentDeclaration', 'קראתי את ההצהרה, ואני מאשר/ת שהפרטים שמסרתי נכונים.'],
                  ['consentPrivacy', null],
                ] as const
              ).map(([id, text]) => (
                <div key={id}>
                  <label className="flex cursor-pointer items-start gap-3 leading-relaxed">
                    <input
                      id={id}
                      type="checkbox"
                      checked={form[id]}
                      onChange={(e) => set(id, e.target.checked)}
                      className="mt-1 h-5 w-5 shrink-0 accent-sage"
                      aria-invalid={Boolean(errors[id])}
                      aria-describedby={errors[id] ? `${id}-error` : undefined}
                    />
                    <span>
                      {text ?? (
                        <>
                          אני מסכים/ה שהמידע יישמר אצל רתם, רק לצורך התאמת האימונים ובטיחותם, לפי{' '}
                          <a href={`${root}privacy/`} target="_blank" rel="noopener" className="text-sage underline underline-offset-4">
                            מדיניות הפרטיות
                          </a>
                          . אפשר לבקש למחוק אותו בכל עת.
                        </>
                      )}
                    </span>
                  </label>
                  <FieldError id={id} message={errors[id]} />
                </div>
              ))}
            </div>

            {submitted && Object.keys(errors).length > 0 && (
              <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                חסרים עוד כמה פרטים. סימנו אותם באדום למעלה.
              </p>
            )}
            {status === 'failed' && (
              <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                לא הצלחנו לשלוח את ההצהרה. כדאי לנסות שוב בעוד רגע. אם זה לא מסתדר,{' '}
                <a className="underline" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  כתבו לרתם בווטסאפ
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-sage px-7 py-4 text-lg font-medium text-white transition-colors hover:bg-sage-deep disabled:opacity-60"
            >
              {status === 'sending' ? 'רגע, שולחים…' : 'שליחת ההצהרה'}
            </button>
            <p className="mt-3 text-center text-sm text-muted">תאריך מילוי: {todayLabel}</p>
          </form>
        )}
      </main>
    </div>
  );
}
