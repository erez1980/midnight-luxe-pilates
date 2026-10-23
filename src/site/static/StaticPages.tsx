import React from 'react';
import type { Exercise } from '../../types';
import { HE } from '../content';
import { CONDITIONS, DISCLAIMER, SUITABILITY_LABEL, assessExercise, type ConditionId, type Suitability } from '../../utils/conditions';
import { exerciseProps, propLabel } from '../../utils/props';
import type { Landing } from './landings';

// Static (no JavaScript) Hebrew pages rendered at build time by
// scripts/prerender.mjs: the public exercise library and the intent pages.
// They share the site's stylesheet, so only Tailwind classes the site build
// already scans are used. `root` is the relative path back to the site root.

const { BRAND, CONTACT, FOOTER_PAGES, UI } = HE;

export const APPARATUS: Record<Exercise['apparatus'], { label: string; title: string }> = {
  mat: { label: 'מזרן', title: 'תרגילי פילאטיס מזרן' },
  reformer: { label: 'רפורמר', title: 'תרגילי פילאטיס רפורמר' },
  cadillac: { label: 'קדילק', title: 'תרגילי פילאטיס קדילק' },
  chair: { label: 'כיסא', title: 'תרגילי פילאטיס כיסא (Wunda Chair)' },
  props: { label: 'אביזרים', title: 'תרגילי פילאטיס עם אביזרים' },
};
export const APPARATUS_ORDER: Exercise['apparatus'][] = ['mat', 'reformer', 'cadillac', 'chair', 'props'];

export function exerciseSlug(ex: Exercise) {
  return ex.englishName
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const whatsappHref = (message: string) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;

const STATUS_TONE: Record<Suitability, string> = {
  suitable: 'bg-sage-soft text-sage-deep',
  modify: 'bg-gold-soft/60 text-gold-deep',
  avoid: 'bg-red-100 text-red-800',
};

function Shell({ root, children, breadcrumbs }: { root: string; children: React.ReactNode; breadcrumbs: { href?: string; label: string }[] }) {
  return (
    <>
      <header className="border-b border-line bg-ivory/90">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-5 md:px-8">
          <a href={root} className="flex items-center gap-3">
            <img src={`${root}brand/emblem-light.webp`} alt="" width={47} height={36} className="h-9 w-auto" />
            <span className="whitespace-nowrap font-display text-xl font-medium text-gold-deep">{BRAND.name}</span>
          </a>
          <nav className="hidden items-center gap-7 text-[15px] text-muted md:flex" aria-label={UI.mainNav}>
            <a href={`${root}#about`} className="hover:text-ink">על רתם</a>
            <a href={`${root}#book`} className="hover:text-ink">הזמנות ואירועים</a>
            <a href={`${root}exercises/`} className="hover:text-ink">ספריית תרגילים</a>
            <a href={`${root}app/`} className="hover:text-ink">כלי בניית שיעורים</a>
          </nav>
          <a
            href={whatsappHref(CONTACT.whatsappGreeting)}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-full bg-sage px-5 py-2 text-sm font-medium text-white hover:bg-sage-deep"
          >
            {UI.contactLabels.whatsapp}
          </a>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1100px] px-5 pb-24 pt-8 md:px-8">
        <nav aria-label="פירורי לחם" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {breadcrumbs.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">›</span>}
                {b.href ? (
                  <a href={b.href} className="py-1 hover:text-ink">{b.label}</a>
                ) : (
                  <span aria-current="page" className="text-ink">{b.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {children}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-12 md:flex-row md:items-start md:justify-between md:px-8">
          <div>
            <a href={root} className="font-display text-xl text-gold-deep">{BRAND.name}</a>
            <p className="mt-2 max-w-sm text-sm text-muted">{BRAND.certification}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 text-sm text-muted [&>a]:py-1.5" aria-label={UI.footerNav}>
            <a href={root} className="hover:text-ink">דף הבית</a>
            {FOOTER_PAGES.map((p) => (
              <a key={p.href} href={`${root}${p.href}`} className="hover:text-ink">{p.label}</a>
            ))}
            <a href={`${root}app/`} className="hover:text-ink">כלי בניית שיעורים</a>
            <a href={`${root}app/?page=privacy`} className="hover:text-ink">{UI.privacy}</a>
          </nav>
          <div className="flex flex-col gap-1 text-sm text-muted [&_a]:py-1.5">
            <a href={`mailto:${CONTACT.email}`} dir="ltr" className="hover:text-ink">{CONTACT.email}</a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" dir="ltr" className="hover:text-ink">@rotem_shap</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function CtaBox({ title, text, href, label, external }: { title: string; text: string; href: string; label: string; external?: boolean }) {
  return (
    <section className="mt-16 rounded-[28px] bg-night px-6 py-10 text-center text-cream md:px-12">
      <h2 className="font-display text-3xl font-light md:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-cream/80">{text}</p>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="mt-7 inline-flex items-center justify-center rounded-full bg-gold px-7 py-3.5 font-medium text-night hover:bg-gold-soft"
      >
        {label}
      </a>
    </section>
  );
}

function ExerciseLink({ ex, root, meta = true }: { ex: Exercise; root: string; meta?: boolean }) {
  return (
    <a href={`${root}exercises/${exerciseSlug(ex)}/`} className="group block rounded-2xl border border-line bg-white/60 px-4 py-3 hover:border-sage">
      <span className="block font-medium text-ink group-hover:text-sage">{ex.name}</span>
      {meta && (
        <span className="mt-0.5 block text-xs text-muted">
          {APPARATUS[ex.apparatus].label} · {ex.difficultyLabel}
          {ex.categoryLabel ? ` · ${ex.categoryLabel}` : ''}
        </span>
      )}
    </a>
  );
}

// ---------- exercise page ----------

export function relatedExercises(ex: Exercise, all: Exercise[], count = 6) {
  const same = all.filter((o) => o.id !== ex.id && o.apparatus === ex.apparatus);
  const score = (o: Exercise) => (o.category === ex.category ? 2 : 0) + (o.difficulty === ex.difficulty ? 1 : 0);
  return [...same].sort((a, b) => score(b) - score(a)).slice(0, count);
}

export function ExercisePage({ ex, all, root }: { ex: Exercise; all: Exercise[]; root: string }) {
  const props = exerciseProps(ex);
  const related = relatedExercises(ex, all);
  return (
    <Shell
      root={root}
      breadcrumbs={[
        { href: root, label: 'דף הבית' },
        { href: `${root}exercises/`, label: 'ספריית תרגילים' },
        { href: `${root}exercises/#${ex.apparatus}`, label: APPARATUS[ex.apparatus].label },
        { label: ex.name },
      ]}
    >
      <article>
        <header className="mt-8 max-w-3xl">
          <p className="text-sm font-medium text-gold-deep">
            תרגיל פילאטיס {APPARATUS[ex.apparatus].label} · {ex.difficultyLabel}
            {ex.categoryLabel ? ` · ${ex.categoryLabel}` : ''}
          </p>
          <h1 className="mt-3 font-display text-4xl font-light leading-tight text-ink md:text-6xl">{ex.name}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{ex.benefits}</p>
        </header>

        <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ['מכשיר', APPARATUS[ex.apparatus].label],
            ['רמה', ex.difficultyLabel],
            ['משך מומלץ', `${ex.durationMinutes} דק׳`],
            ['אביזרים', props.length ? props.map((p) => propLabel(p)).join(', ') : 'ללא'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-line bg-sand/60 px-4 py-3">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <section>
              <h2 className="font-display text-3xl font-light text-ink">איך מבצעים</h2>
              <ol className="mt-5 space-y-4">
                {ex.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4 leading-relaxed text-ink">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sm font-medium text-sage-deep">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
            <section className="mt-10">
              <h2 className="font-display text-3xl font-light text-ink">נשימה</h2>
              <p className="mt-4 leading-relaxed text-muted">{ex.breathing}</p>
            </section>
          </div>
          <aside>
            <section className="rounded-[28px] border border-line bg-sand/60 p-6">
              <h2 className="text-lg font-medium text-ink">שרירים עיקריים</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ex.targetMuscles.map((m) => (
                  <li key={m} className="rounded-full border border-line bg-ivory px-3 py-1 text-sm text-ink">{m}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-3xl font-light text-ink">התאמה למצבים מיוחדים</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted">{DISCLAIMER}</p>
          <div className="mt-6 overflow-hidden rounded-[20px] border border-line">
            <table className="w-full text-start text-sm">
              <thead className="bg-sand text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start font-medium">מצב</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">התאמה</th>
                  <th scope="col" className="px-4 py-3 text-start font-medium">למה</th>
                </tr>
              </thead>
              <tbody>
                {CONDITIONS.map((c) => {
                  const a = assessExercise(ex, c.id);
                  return (
                    <tr key={c.id} className="border-t border-line">
                      <th scope="row" className="px-4 py-3 text-start font-medium text-ink">{c.label}</th>
                      <td className="px-4 py-3">
                        <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[a.status]}`}>
                          {SUITABILITY_LABEL[a.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{a.reasons.join(' · ') || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-3xl font-light text-ink">תרגילים קשורים</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}><ExerciseLink ex={r} root={root} /></li>
              ))}
            </ul>
          </section>
        )}

        <CtaBox
          title="בונים שיעור?"
          text="בכלי בניית השיעורים מוסיפים את התרגיל הזה למערך, מתאימים לפציעות ולהריון ומעבירים את השיעור מהטלפון."
          href={`${root}app/`}
          label="לכלי בניית השיעורים"
        />
      </article>
    </Shell>
  );
}

// ---------- exercise index ----------

export function ExerciseIndexPage({ all, root }: { all: Exercise[]; root: string }) {
  return (
    <Shell root={root} breadcrumbs={[{ href: root, label: 'דף הבית' }, { label: 'ספריית תרגילים' }]}>
      <header className="mt-8 max-w-3xl">
        <p className="text-sm font-medium text-gold-deep">למדריכות, למדריכים ולמתאמנים</p>
        <h1 className="mt-3 font-display text-4xl font-light leading-tight text-ink md:text-6xl">ספריית תרגילי פילאטיס</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          {all.length} תרגילי פילאטיס מזרן, מכשירים ואביזרים — לכל תרגיל הוראות ביצוע, נשימה, שרירים עיקריים והתאמה לגב תחתון, הריון,
          אחרי לידה ומצבים נוספים.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="מכשירים">
          {APPARATUS_ORDER.map((a) => (
            <a key={a} href={`#${a}`} className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:border-sage hover:text-sage">
              {APPARATUS[a].label} ({all.filter((e) => e.apparatus === a).length})
            </a>
          ))}
        </nav>
      </header>
      {APPARATUS_ORDER.map((a) => {
        const list = all.filter((e) => e.apparatus === a);
        if (!list.length) return null;
        return (
          <section key={a} id={a} className="mt-14 scroll-mt-6">
            <h2 className="font-display text-3xl font-light text-ink">{APPARATUS[a].title}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((ex) => (
                <li key={ex.id}><ExerciseLink ex={ex} root={root} /></li>
              ))}
            </ul>
          </section>
        );
      })}
      <CtaBox
        title="מהתרגילים — לשיעור שלם"
        text="בכלי בניית השיעורים בוחרים תרגילים מהספרייה, מסדרים חימום, גוף שיעור ושחרור, ומעבירים את השיעור מהטלפון."
        href={`${root}app/`}
        label="לכלי בניית השיעורים"
      />
    </Shell>
  );
}

// ---------- intent landing pages ----------

function ConditionLists({ all, root, condition, title }: { all: Exercise[]; root: string; condition: ConditionId; title: string }) {
  const groups: Suitability[] = ['suitable', 'modify', 'avoid'];
  const heading: Record<Suitability, string> = { suitable: 'מתאימים', modify: 'דורשים התאמה', avoid: 'עדיף להימנע' };
  const assessed = all.map((ex) => ({ ex, a: assessExercise(ex, condition) }));
  const reasons = [...new Set(assessed.flatMap(({ a }) => (a.status === 'suitable' ? [] : a.reasons)))];
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl font-light text-ink">{title}</h2>
      {reasons.length > 0 && (
        <>
          <h3 className="mt-6 text-lg font-medium text-ink">עיקרי ההתאמה</h3>
          <ul className="mt-3 grid gap-2 text-muted sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />{r}</li>
            ))}
          </ul>
        </>
      )}
      {groups.map((g) => {
        const list = assessed.filter(({ a }) => a.status === g);
        return (
          <details key={g} className="mt-6 rounded-[20px] border border-line bg-white/60 p-5" open={g === 'suitable'}>
            <summary className="cursor-pointer text-lg font-medium text-ink">
              <span className={`me-2 inline-block rounded-full px-2.5 py-0.5 text-xs ${STATUS_TONE[g]}`}>{SUITABILITY_LABEL[g]}</span>
              {heading[g]} ({list.length})
            </summary>
            {APPARATUS_ORDER.map((app) => {
              const items = list.filter(({ ex }) => ex.apparatus === app);
              if (!items.length) return null;
              return (
                <div key={app} className="mt-4">
                  <h4 className="text-sm font-medium text-muted">{APPARATUS[app].label}</h4>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {items.map(({ ex }) => (
                      <li key={ex.id}>
                        <a href={`${root}exercises/${exerciseSlug(ex)}/`} className="inline-block py-1 text-sage underline decoration-gold/40 underline-offset-4 hover:decoration-sage">{ex.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </details>
        );
      })}
    </section>
  );
}

export function LandingPage({ page, all, root }: { page: Landing; all: Exercise[]; root: string }) {
  const ctaHref = page.cta.message ? whatsappHref(page.cta.message) : `${root}app/`;
  return (
    <Shell root={root} breadcrumbs={[{ href: root, label: 'דף הבית' }, { label: page.h1 }]}>
      <header className="mt-8 max-w-3xl">
        <p className="text-sm font-medium text-gold-deep">{page.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-light leading-tight text-ink md:text-6xl">{page.h1}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{page.intro}</p>
        <a
          href={ctaHref}
          {...(page.cta.message ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-sage px-7 py-3.5 font-medium text-white hover:bg-sage-deep"
        >
          {page.cta.label}
        </a>
      </header>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {page.sections.map((s) => (
          <section key={s.title} className={`rounded-[28px] border border-line bg-sand/60 p-7 ${s.steps || page.sections.length === 1 ? 'md:col-span-2' : ''}`}>
            <h2 className="font-display text-2xl text-ink md:text-3xl">{s.title}</h2>
            {s.text && <p className="mt-3 leading-relaxed text-muted">{s.text}</p>}
            {s.points && (
              <ul className="mt-4 space-y-2 text-ink">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />{p}</li>
                ))}
              </ul>
            )}
            {s.steps && (
              <ol className="mt-5 grid gap-5 md:grid-cols-3">
                {s.steps.map((step, i) => (
                  <li key={step.title}>
                    <span className="font-display text-4xl text-gold">{i + 1}</span>
                    <h3 className="mt-1 text-lg font-medium text-ink">{step.title}</h3>
                    <p className="mt-1 text-muted">{step.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>

      {page.extra === 'conditions' && (
        <>
          <ConditionLists all={all} root={root} condition="pregnancy" title="תרגילי פילאטיס בהריון" />
          <ConditionLists all={all} root={root} condition="postnatal" title="תרגילי פילאטיס אחרי לידה" />
          <p className="mt-6 text-sm text-muted">{DISCLAIMER}</p>
        </>
      )}

      {page.extra !== 'conditions' && (
        <section className="mt-14 grid items-center gap-8 rounded-[28px] border border-line p-7 md:grid-cols-[160px_1fr]">
          <img src={`${root}photos/rotem.webp`} alt={BRAND.photoAlt} width={160} height={160} loading="lazy" className="h-40 w-40 rounded-full object-cover" />
          <div>
            <h2 className="font-display text-2xl text-ink md:text-3xl">נעים להכיר, אני רתם</h2>
            <p className="mt-3 leading-relaxed text-muted">
              מדריכת פילאטיס מזרן ומכשירים, בוגרת מרכז מרתה פילאטיס (קורס מזרן 209 שעות, קורס מכשירים 304 שעות). בשיעורים שלי הדגש הוא על
              נשימה, יציבה ותנועה מבוקרת, עם תשומת לב לרמה ולצרכים של כל מתאמנת ומתאמן.
            </p>
            <a href={`${root}#about`} className="mt-3 inline-block py-1 text-sage underline decoration-gold/50 underline-offset-4">עוד עליי ועל ההסמכות</a>
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="font-display text-3xl font-light text-ink">שאלות נפוצות</h2>
        <div className="mt-5 space-y-3">
          {page.faq.map((f) => (
            <details key={f.q} className="faq rounded-[20px] border border-line bg-white/60 p-5">
              <summary className="cursor-pointer text-lg font-medium text-ink">{f.q}</summary>
              <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaBox title={page.cta.title} text={page.cta.text} href={ctaHref} label={page.cta.label} external={!!page.cta.message} />
    </Shell>
  );
}

// ---------- 404 ----------

export function NotFoundPage({ root }: { root: string }) {
  return (
    <Shell root={root} breadcrumbs={[{ href: root, label: 'דף הבית' }, { label: 'העמוד לא נמצא' }]}>
      <div className="mx-auto mt-16 max-w-xl text-center">
        <p className="font-display text-7xl text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl font-light text-ink">העמוד לא נמצא</h1>
        <p className="mt-4 text-muted" lang="en" dir="ltr">Page not found.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={root} className="rounded-full bg-sage px-6 py-3 font-medium text-white hover:bg-sage-deep">לדף הבית</a>
          <a href={`${root}exercises/`} className="rounded-full border border-line px-6 py-3 text-ink hover:border-sage">לספריית התרגילים</a>
          <a href={`${root}en/`} className="rounded-full border border-line px-6 py-3 text-ink hover:border-sage" lang="en">English site</a>
        </div>
      </div>
    </Shell>
  );
}
