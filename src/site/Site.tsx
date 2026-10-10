import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpLeft, Award, Building2, Check, HeartPulse, Library, ListOrdered, MapPin, Menu, Phone, Mail, PartyPopper, Play, Plus, Settings2, Smartphone, Users, Wind, X } from 'lucide-react';
import {
  ABOUT,
  APP_PROMO,
  AUDIENCE,
  BOOKING,
  BRAND,
  CLASSES,
  CONTACT,
  FAQ,
  HERO,
  LOCATIONS,
  NAV_LINKS,
  PHOTOS,
  PRICING,
  PRINCIPLES,
  PRINCIPLES_TICKER,
  SHOW_LOCATIONS,
  SHOW_PRICING,
  TESTIMONIALS,
  TOOL,
} from './content';

const ASSET = import.meta.env.BASE_URL;
const APP_URL = `${ASSET}app/`;
const EMBLEM_LIGHT = `${ASSET}brand/emblem-light.webp`;
const EMBLEM_DARK = `${ASSET}brand/emblem-dark.webp`;

// One primary "book a class" action, picked from whatever contact details
// exist: WhatsApp beats phone beats email.
function primaryContact(subject = 'תיאום שיעור פילאטיס', message = CONTACT.whatsappGreeting) {
  if (CONTACT.whatsapp) {
    return {
      href: `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`,
      external: true,
    };
  }
  if (CONTACT.phone) return { href: `tel:${CONTACT.phone.replace(/[^\d+]/g, '')}`, external: false };
  return {
    href: `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`,
    external: false,
  };
}
const BOOK = primaryContact();
const SCHEDULE = primaryContact(
  'בקשת מערכת שעות ומיקום לשיעורי פילאטיס',
  'היי רתם, הגעתי מהאתר ואשמח לקבל את המיקומים והשעות של השיעורים הקבוצתיים 🙂'
);
const CONTACT_LABEL = CONTACT.whatsapp ? 'לשיחה בווטסאפ' : CONTACT.phone ? 'לשיחה ותיאום' : 'לשליחת פנייה במייל';
const bookLinkProps = BOOK.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

// ---------- small building blocks ----------

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

function Eyebrow({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <p
      className={`flex items-center gap-3 text-sm font-medium ${
        tone === 'dark' ? 'text-gold-soft' : 'text-gold-deep'
      }`}
    >
      <span className={`h-px w-8 ${tone === 'dark' ? 'bg-gold/70' : 'bg-gold'}`} aria-hidden="true" />
      {children}
    </p>
  );
}

function BookButton({ children, className = '', tone = 'sage' }: { children: React.ReactNode; className?: string; tone?: 'sage' | 'gold' }) {
  const colors =
    tone === 'gold'
      ? 'bg-gold text-night hover:bg-gold-soft'
      : 'bg-sage text-white hover:bg-sage-deep';
  return (
    <a
      href={BOOK.href}
      {...bookLinkProps}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-medium shadow-[0_10px_30px_-12px_rgba(76,92,66,0.55)] transition-all duration-500 ease-soft hover:-translate-y-0.5 ${colors} ${className}`}
    >
      {children}
    </a>
  );
}

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.2 4.24-9.44 9.45-9.44a9.38 9.38 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44zm8.04-17.49A11.3 11.3 0 0 0 12.05.67C5.79.67.69 5.76.69 12.03c0 2 .52 3.96 1.52 5.68L.6 23.33l5.75-1.5a11.33 11.33 0 0 0 5.69 1.45h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.04-1.18-5.89-3.32-8.04z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.5V4.46A20 20 0 0 0 14.3 4.3c-2.17 0-3.66 1.33-3.66 3.76v2.44H8.2v3h2.44V21h2.86z" />
    </svg>
  );
}

// Photo inside an arch; until a real photo exists, the brand emblem on a soft
// gradient stands in so the layout already reads as finished.
function ArchPhoto({ src, alt, tone = 'light', className = '', priority = false }: { src: string | null; alt: string; tone?: 'light' | 'dark'; className?: string; priority?: boolean }) {
  return (
    <div
      className={`arch relative overflow-hidden ${
        tone === 'dark'
          ? 'bg-[radial-gradient(120%_80%_at_50%_20%,#2c3126_0%,#1b1f19_70%)]'
          : 'bg-[radial-gradient(120%_80%_at_50%_15%,#ffffff_0%,#f2ede2_55%,#eaeee2_100%)]'
      } ${className}`}
    >
      {src ? (
        <img src={`${ASSET}${src}`} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-[14%]">
          <img
            src={tone === 'dark' ? EMBLEM_DARK : EMBLEM_LIGHT}
            alt=""
            className="float w-full max-w-[340px] select-none"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}

// ---------- sections ----------

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const background = Array.from(document.querySelectorAll<HTMLElement>('main, footer, [data-mobile-book-bar]'));
    const previous = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    const items = () => Array.from(headerRef.current?.querySelectorAll<HTMLElement>('a[href], button') || []).filter((element) => element.getClientRects().length > 0);
    headerRef.current?.querySelector<HTMLElement>('#mobile-menu a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      if (event.key === 'Tab') {
        const focusable = items(); const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const media = window.matchMedia('(min-width: 1024px)');
    const onResize = () => { if (media.matches) setOpen(false); };
    media.addEventListener('change', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      background.forEach((element, index) => { element.inert = previous[index]; });
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey); media.removeEventListener('change', onResize);
      menuButtonRef.current?.focus();
    };
  }, [open]);

  return (
    <header ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-soft ${
        scrolled || open ? 'border-b border-line/80 bg-ivory/85 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label={`${BRAND.name} — לראש העמוד`}>
          <img src={EMBLEM_LIGHT} alt="" className="h-9 w-auto" />
          <span className="font-display text-xl font-medium text-gold-deep">{BRAND.name}</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="ניווט ראשי">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-[15px] text-muted transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={APP_URL}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-sage hover:text-sage"
          >
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            {APP_PROMO.navigationLabel}
          </a>
          <a
            href={BOOK.href}
            {...bookLinkProps}
            className="rounded-full bg-sage px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-deep"
          >
            {CONTACT_LABEL}
          </a>
        </div>

        <button ref={menuButtonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-me-2 flex h-11 w-11 items-center justify-center rounded-full text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-72px)] overflow-y-auto bg-ivory px-6 pb-10 pt-6 lg:hidden">
          <nav className="flex flex-col" aria-label="ניווט ראשי">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-5 font-display text-3xl text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <BookButton className="w-full">{CONTACT_LABEL}</BookButton>
            <a
              href={APP_URL}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-7 py-3.5 text-muted"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              {APP_PROMO.navigationLabel}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[72px]">
      {/* Soft ambient light — the "breathing" studio feel. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="breathe absolute -top-32 left-[-10%] h-[520px] w-[520px] rounded-full bg-sage-light/25 blur-3xl" />
        <div className="breathe absolute bottom-[-20%] right-[-8%] h-[460px] w-[460px] rounded-full bg-gold-soft/40 blur-3xl [animation-delay:-5s]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-[1240px] items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-20">
        <div>
          <Reveal>
            <Eyebrow>{HERO.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 font-display text-[clamp(3.2rem,9vw,6.5rem)] font-light leading-[0.98] tracking-tight text-ink">
              {HERO.title.map((line, i) => (
                <span key={line} className={`block ${i === HERO.title.length - 1 ? 'text-sage' : ''}`}>
                  {line}
                </span>
              ))}
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-8 max-w-[34rem] text-lg leading-relaxed text-muted md:text-xl">{HERO.subtitle}</p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Two gates: people booking Rotem, and instructors using the tool. */}
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-7 py-3.5 text-base font-medium text-white shadow-[0_10px_30px_-12px_rgba(76,92,66,0.55)] transition-all duration-500 ease-soft hover:-translate-y-0.5 hover:bg-sage-deep"
              >
                {HERO.primaryCta}
              </a>
              <a
                href={APP_URL}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sage/60 px-7 py-3.5 text-base text-sage transition-colors hover:border-sage hover:bg-sage-soft"
              >
                <ListOrdered className="h-4 w-4" aria-hidden="true" />
                {HERO.secondaryCta}
              </a>
            </div>
          </Reveal>
          <Reveal delay={480}>
            <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-sm text-muted">
              {HERO.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative mx-auto w-full max-w-[440px]">
          {/* Offset gold outline behind the arch, drawn in on load. */}
          <svg
            className="absolute -left-5 -top-5 h-full w-full text-gold/70"
            viewBox="0 0 440 560"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="draw"
              pathLength={1}
              d="M1 559V220C1 99 99 1 220 1s219 98 219 219v339H1z"
              stroke="currentColor"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ArchPhoto priority src={PHOTOS.hero} alt={`${BRAND.owner} — ${BRAND.name}`} className="aspect-[440/560] w-full shadow-[0_40px_80px_-40px_rgba(46,49,40,0.35)]" />
          <div className="absolute -bottom-6 right-4 rounded-2xl border border-line bg-ivory/95 px-5 py-4 shadow-[0_20px_40px_-24px_rgba(46,49,40,0.4)] backdrop-blur md:right-[-2rem]">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <Award className="h-4 w-4 text-gold-deep" aria-hidden="true" />
              מזרן · מכשירים
            </p>
            <p className="mt-1 text-xs text-muted">הסמכה — מרתה פילאטיס</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Ticker() {
  const words = [...PRINCIPLES_TICKER, ...PRINCIPLES_TICKER];
  return (
    <div className="overflow-hidden border-y border-line bg-sand py-5" aria-hidden="true">
      <div className="marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((word, i) => (
              <span key={`${copy}-${i}`} className="flex items-center font-display text-2xl text-ink/80 md:text-3xl">
                <span className="px-8">{word}</span>
                <span className="text-base text-gold">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="relative py-24 md:py-36">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <Reveal className="relative mx-auto w-full max-w-[400px] lg:order-none">
          <ArchPhoto src={PHOTOS.about} alt={BRAND.owner} tone="dark" className="aspect-[4/5] w-full" />
          <div className="absolute -bottom-5 -left-5 hidden h-28 w-28 rounded-full border border-gold/60 md:block" aria-hidden="true" />
        </Reveal>

        <div>
          <Reveal>
            <Eyebrow>על רתם</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight text-ink md:text-6xl">{ABOUT.title}</h2>
          </Reveal>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
            {ABOUT.paragraphs.map((p, i) => (
              <Reveal key={i} delay={160 + i * 80}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={420}>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <span className="font-display text-5xl text-gold" aria-hidden="true">
                {ABOUT.signature}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 text-sm text-ink">
                <Award className="h-4 w-4 text-gold-deep" aria-hidden="true" />
                {BRAND.certification}
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Mat work is bodyweight and breath-led; apparatus work is spring-resisted
// machinery — the icons name what each class actually is, not its position
// in a list (there are only two, and neither comes "before" the other).
const CLASS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  mat: Wind,
  apparatus: Settings2,
};

function Classes() {
  return (
    <section id="classes" className="bg-sand py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>השיעורים</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">שתי דרכים לנוע. מטרה אחת.</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              על המזרן או על המכשירים — כל שיעור בנוי סביב הגוף שלך, הרמה שלך והמטרות שלך.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {CLASSES.map((c, i) => {
            const Icon = CLASS_ICON[c.id];
            return (
              <Reveal as="article" key={c.id} delay={i * 140}>
                <div className="group flex h-full flex-col rounded-[28px] border border-line bg-ivory p-8 transition-all duration-700 ease-soft hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_30px_60px_-36px_rgba(46,49,40,0.45)] md:p-12">
                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold-deep md:h-16 md:w-16">
                      <Icon className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
                    </span>
                    <span className="mt-3 h-px w-16 bg-line transition-all duration-700 ease-soft group-hover:w-24 group-hover:bg-gold" aria-hidden="true" />
                  </div>
                  <h3 className="mt-8 font-display text-3xl text-ink md:text-4xl">{c.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{c.text}</p>
                  <ul className="mt-8 space-y-3 border-t border-line pt-6">
                    {c.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-ink">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <h3 className="font-display text-3xl font-light leading-snug md:text-4xl">
              למי זה מתאים?
              <span className="mt-2 block">כמעט לכל אחת ואחד.</span>
            </h3>
          </Reveal>
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {AUDIENCE.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 60} className="flex gap-3 border-b border-line pb-4 text-ink">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {item}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>שיעורים ומחירים</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">{PRICING.title}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">{PRICING.intro}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {PRICING.plans.map((plan, i) => {
            const target = plan.cta === 'schedule' ? SCHEDULE : BOOK;
            const linkProps = target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <Reveal as="article" key={plan.id} delay={i * 120}>
                <div
                  className={`relative flex h-full flex-col rounded-[28px] border p-8 md:p-10 ${
                    plan.featured
                      ? 'border-gold/70 bg-night text-cream shadow-[0_30px_60px_-30px_rgba(27,31,25,0.6)]'
                      : 'border-line bg-ivory text-ink'
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3.5 right-8 rounded-full bg-gold px-4 py-1 text-xs font-medium text-night">
                      מומלץ להתחלה
                    </span>
                  )}
                  <h3 className="font-display text-2xl md:text-3xl">{plan.name}</h3>
                  {plan.prices ? (
                    <div className="mt-6">
                      <dl className="space-y-2">
                        {plan.prices.map((p) => (
                          <div key={p.label} className="flex items-baseline justify-between gap-3">
                            <dt className={plan.featured ? 'text-cream/75' : 'text-muted'}>{p.label}</dt>
                            <dd className={`font-display text-4xl font-light ${plan.featured ? 'text-gold' : 'text-ink'}`}>{p.price}</dd>
                          </div>
                        ))}
                      </dl>
                      {plan.unit && <p className={`mt-2 text-sm ${plan.featured ? 'text-cream/60' : 'text-muted'}`}>{plan.unit}</p>}
                    </div>
                  ) : (
                    <p className="mt-6 flex items-baseline gap-3">
                      <span className={`font-display text-4xl font-light md:text-5xl ${plan.featured ? 'text-gold' : 'text-ink'}`}>{plan.price}</span>
                      {plan.unit && <span className={plan.featured ? 'text-cream/70' : 'text-muted'}>{plan.unit}</span>}
                    </p>
                  )}
                  <p className={`mt-5 leading-relaxed ${plan.featured ? 'text-cream/75' : 'text-muted'}`}>{plan.text}</p>
                  <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 ${plan.featured ? 'border-night-line' : 'border-line'}`}>
                    {plan.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            plan.featured ? 'bg-gold/20 text-gold' : 'bg-sage-soft text-sage'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={target.href}
                    {...linkProps}
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-medium transition-colors ${
                      plan.featured
                        ? 'bg-gold text-night hover:bg-gold-soft'
                        : 'border border-sage text-sage hover:bg-sage hover:text-white'
                    }`}
                  >
                    {CONTACT.whatsapp && <WhatsAppIcon className="h-4 w-4" />}
                    {plan.ctaLabel}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const BOOKING_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  event: PartyPopper,
  studio: Building2,
  private: Users,
};

// Builds a ready-to-send WhatsApp (or email) message from the form, so an
// inquiry reaches Rotem with every detail she needs to answer it.
function BookingForm() {
  const [type, setType] = useState(BOOKING.options[0].id);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [participants, setParticipants] = useState('');
  const [notes, setNotes] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const option = BOOKING.options.find((o) => o.id === type);
    const lines = [
      'היי רתם, הגעתי מהאתר 🙂',
      `אשמח לתאם: ${option?.title ?? ''}`,
      name && `שם: ${name}`,
      date && `תאריך משוער: ${date}`,
      place && `מקום: ${place}`,
      participants && `מספר משתתפים: ${participants}`,
      notes && `פרטים נוספים: ${notes}`,
    ].filter(Boolean);
    const text = lines.join('\n');
    const url = CONTACT.whatsapp
      ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`
      : `mailto:${CONTACT.email}?subject=${encodeURIComponent(option?.title ?? 'פנייה מהאתר')}&body=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const field =
    'mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-ink placeholder:text-muted/70 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20';

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-line bg-ivory p-6 md:p-10">
      <h3 className="font-display text-2xl md:text-3xl">{BOOKING.form.title}</h3>
      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-ink">סוג השיעור</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {BOOKING.options.map((o) => (
            <label
              key={o.id}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${
                type === o.id ? 'border-sage bg-sage text-white' : 'border-line text-muted hover:border-sage hover:text-sage'
              }`}
            >
              <input type="radio" name="booking-type" value={o.id} checked={type === o.id} onChange={() => setType(o.id)} className="sr-only" />
              {o.title}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          שם
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="block text-sm font-medium text-ink">
          תאריך משוער
          <input className={field} value={date} onChange={(e) => setDate(e.target.value)} placeholder="למשל: חמישי, 20.11 בערב" />
        </label>
        <label className="block text-sm font-medium text-ink">
          מקום
          <input className={field} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="יישוב / סטודיו / אולם" />
        </label>
        <label className="block text-sm font-medium text-ink">
          מספר משתתפים
          <input className={field} value={participants} onChange={(e) => setParticipants(e.target.value)} inputMode="numeric" placeholder="למשל: 12" />
        </label>
      </div>
      <label className="mt-5 block text-sm font-medium text-ink">
        עוד משהו שחשוב לדעת?
        <textarea className={`${field} min-h-24 resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="אופי האירוע, רמת המשתתפים, פציעות, הריון…" />
      </label>
      <button
        type="submit"
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage px-7 py-3.5 font-medium text-white transition-colors hover:bg-sage-deep sm:w-auto"
      >
        {CONTACT.whatsapp ? <WhatsAppIcon /> : <Mail className="h-5 w-5" aria-hidden="true" />}
        {CONTACT.whatsapp ? BOOKING.form.submit : 'שליחה במייל'}
      </button>
      <p className="mt-3 text-sm text-muted">{BOOKING.form.note}</p>
    </form>
  );
}

function Booking() {
  return (
    <section id="book" className="py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>הזמנות ואירועים</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">{BOOKING.title}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">{BOOKING.intro}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {BOOKING.options.map((o, i) => {
            const Icon = BOOKING_ICON[o.id] ?? Users;
            return (
              <Reveal as="article" key={o.id} delay={i * 120}>
                <div className="flex h-full flex-col rounded-[28px] border border-line bg-sand/60 p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold-deep">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl md:text-3xl">{o.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-muted">{o.text}</p>
                  <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-ink">
                    {o.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120} className="mt-10">
          <BookingForm />
        </Reveal>
      </div>
    </section>
  );
}

const TOOL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  library: Library,
  conditions: HeartPulse,
  builder: ListOrdered,
  coach: Play,
};

// Illustrative only: shows how the conditions layer reads inside the tool.
const TOOL_PREVIEW = [
  { name: 'Cat Stretch', status: 'מתאים', tone: 'bg-sage-soft text-sage-deep' },
  { name: 'The Hundred', status: 'בהתאמה', tone: 'bg-gold-soft/60 text-gold-deep' },
  { name: 'Swan Dive', status: 'להימנע', tone: 'bg-red-100 text-red-800' },
];

function Tool() {
  return (
    <section id="tool" className="bg-sand py-24 md:py-36">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>למדריכות ומדריכים</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">{TOOL.title}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">{TOOL.intro}</p>
          </Reveal>
          <div className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {TOOL.features.map((f, i) => {
              const Icon = TOOL_ICON[f.id] ?? Library;
              return (
                <Reveal key={f.id} delay={i * 80}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-sage">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-medium text-ink">{f.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{f.text}</p>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={200}>
            <a
              href={APP_URL}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-sage px-7 py-3.5 font-medium text-white transition-colors hover:bg-sage-deep"
            >
              {TOOL.cta}
              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={160} className="mx-auto w-full max-w-[420px]">
          <figure className="rounded-[28px] border border-line bg-ivory p-6 shadow-[0_40px_80px_-48px_rgba(46,49,40,0.5)]">
            <figcaption className="flex items-center justify-between text-sm text-muted">
              <span>מצב: הריון</span>
              <span className="rounded-full border border-line px-3 py-1 text-xs">דוגמה</span>
            </figcaption>
            <ul className="mt-5 space-y-3">
              {TOOL_PREVIEW.map((row) => (
                <li key={row.name} className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3">
                  <span dir="ltr" className="font-medium text-ink">{row.name}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${row.tone}`}>{row.status}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-muted">כלי עזר למדריכות מוסמכות. אינו תחליף לייעוץ רפואי.</p>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section id="method" className="relative overflow-hidden bg-night py-24 text-cream md:py-36">
      <img
        src={EMBLEM_DARK}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/2 w-[720px] max-w-none -translate-y-1/2 opacity-[0.07]"
      />
      <div className="relative mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow tone="dark">השיטה</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">
              שישה עקרונות.
              <span className="block">גוף אחד.</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-cream/70">
              ג׳וזף פילאטיס בנה את השיטה על שישה עקרונות פשוטים. הם מלווים כל שיעור שלי — מהנשימה הראשונה ועד התרגיל האחרון.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid border-t border-night-line sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal
              key={p.title}
              delay={(i % 3) * 120}
              className="border-b border-night-line py-7 sm:py-10 sm:pe-10"
            >
              <span className="font-display text-sm text-gold/80">0{i + 1}</span>
              <h3 className="mt-3 font-display text-3xl">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-cream/65">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Locations() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] border border-line bg-[radial-gradient(90%_120%_at_100%_0%,#eaeee2_0%,#faf8f3_60%)] p-8 md:p-16">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
              <div className="max-w-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-white">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-6 font-display text-3xl font-light md:text-5xl">{LOCATIONS.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">{LOCATIONS.text}</p>
                {LOCATIONS.areas.length > 0 && <p className="mt-4 font-medium">אזורי פעילות: {LOCATIONS.areas.join(' · ')}</p>}
                {LOCATIONS.studios.length > 0 && <ul className="mt-4 space-y-2">{LOCATIONS.studios.map((studio) => <li key={studio.name}>מלמדת בסטודיו ״{studio.name}״{studio.address && ` · ${studio.address}`}{studio.url && <a href={studio.url} target="_blank" rel="noopener noreferrer" className="ms-3 underline">פרטי הסטודיו</a>}</li>)}</ul>}
                {LOCATIONS.comingSoon && <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white/70 px-4 py-2 text-sm text-gold-deep">
                  <span className="h-2 w-2 rounded-full bg-gold breathe" aria-hidden="true" />
                  {LOCATIONS.comingSoon}
                </p>}
              </div>
              <a href={LOCATIONS.scheduleUrl || SCHEDULE.href} {...(LOCATIONS.scheduleUrl ? { target: '_blank', rel: 'noopener noreferrer' } : bookLinkProps)} className="inline-flex items-center justify-center rounded-full bg-sage px-7 py-3.5 text-white hover:bg-sage-deep focus-visible:outline-2">
                {LOCATIONS.scheduleUrl ? 'למערכת השעות' : 'לבקשת מערכת שעות ומיקום'}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section className="bg-sand py-24 md:py-32" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <Reveal>
          <Eyebrow>מילים חמות</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 id="testimonials-title" className="mt-5 font-display text-4xl font-light md:text-6xl">
            מה אומרים בסטודיו
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 120}>
              <figure className="flex h-full flex-col rounded-[28px] border border-line bg-ivory p-8">
                <span className="font-display text-6xl leading-none text-gold" aria-hidden="true">
                  ”
                </span>
                <blockquote className="mt-2 flex-1 text-lg leading-relaxed text-ink">{t.quote}</blockquote>
                <figcaption className="mt-6 text-sm text-muted">— {t.name}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>שאלות נפוצות</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">כל מה שרציתם לשאול</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              לא מצאתם תשובה?{' '}
              <a href={BOOK.href} {...bookLinkProps} className="text-sage underline decoration-gold/60 underline-offset-4 hover:decoration-sage">
                כתבו לי
              </a>{' '}
              — אשמח לעזור.
            </p>
          </Reveal>
        </div>

        <div className="border-t border-line">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <details className="faq group border-b border-line">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-lg text-ink transition-colors hover:text-sage md:text-xl">
                  {item.q}
                  <span className="faq-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-gold-deep group-open:border-gold">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 leading-relaxed text-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const socials = [
    CONTACT.instagram && { href: CONTACT.instagram, label: 'אינסטגרם', icon: <InstagramIcon /> },
    CONTACT.facebook && { href: CONTACT.facebook, label: 'פייסבוק', icon: <FacebookIcon /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <section id="contact" className="px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[32px] bg-night px-6 py-24 text-center text-cream md:rounded-[44px] md:py-36">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="breathe absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage/25 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <Reveal>
            <img src={EMBLEM_DARK} alt="" className="mx-auto h-20 w-auto md:h-24" />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-10 font-display text-4xl font-light leading-tight md:text-7xl">
              הצעד הראשון
              <span className="block text-gold">הוא הכי פשוט.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/70">
              שלחו לי הודעה, ספרו קצת על עצמכם — ונתאים יחד את השיעור הראשון שלכם.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BookButton tone="gold">
                {CONTACT.whatsapp ? <WhatsAppIcon /> : <Mail className="h-5 w-5" aria-hidden="true" />}
                {CONTACT_LABEL}
              </BookButton>
              {CONTACT.phone && (
                <a
                  href={`tel:${CONTACT.phone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-7 py-3.5 text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span dir="ltr">{CONTACT.phone}</span>
                </a>
              )}
            </div>
          </Reveal>
          {CONTACT.email && (CONTACT.whatsapp || CONTACT.phone) && (
            <Reveal delay={350}>
              <a
                href={`mailto:${CONTACT.email}`}
                className="mt-6 inline-flex items-center gap-2 text-cream/70 transition-colors hover:text-gold"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span dir="ltr">{CONTACT.email}</span>
              </a>
            </Reveal>
          )}
          {socials.length > 0 && (
            <Reveal delay={400}>
              <div className="mt-10 flex justify-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-gold hover:text-gold"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-12 pb-28 md:flex-row md:items-center md:justify-between md:px-8 md:pb-12">
        <a href="#top" className="flex items-center gap-3">
          <img src={EMBLEM_LIGHT} alt="" className="h-10 w-auto" />
          <span className="font-display text-xl text-gold-deep">{BRAND.name}</span>
        </a>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="ניווט תחתון">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
          <a href={APP_URL} className="hover:text-ink">
            {APP_PROMO.navigationLabel}
          </a>
        </nav>
        <div className="flex flex-col gap-2 text-sm text-muted md:items-end">
          <div className="flex gap-4">
            <a href={`${APP_URL}?page=privacy`} className="hover:text-ink">
              מדיניות פרטיות
            </a>
            <a href={`${APP_URL}?page=terms`} className="hover:text-ink">
              תנאי שימוש
            </a>
          </div>
          {CONTACT.instagram && (
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-ink">
              <InstagramIcon className="h-4 w-4" />
              <span dir="ltr">@{CONTACT.instagram.replace(/\/+$/, '').split('/').pop()}</span>
            </a>
          )}
          <p>
            © {new Date().getFullYear()} {BRAND.name}. באהבה, {BRAND.owner}.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Mobile-only sticky CTA that appears once the hero's own buttons scroll away.
function MobileBookBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 600;
      const heroButton = document.querySelector('#top a');
      const pastHeroButton = heroButton ? heroButton.getBoundingClientRect().bottom < 72 : false;
      setShow(pastHeroButton && !nearBottom);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  if (!show) return null;
  return (
    <div data-mobile-book-bar className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 md:hidden">
      <BookButton className="w-full shadow-lg">{CONTACT_LABEL}</BookButton>
    </div>
  );
}

export default function Site() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory"
      >
        דילוג לתוכן
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Ticker />
        <About />
        <Classes />
        {SHOW_PRICING && <Pricing />}
        <Booking />
        <Tool />
        <Method />
        {SHOW_LOCATIONS && <Locations />}
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileBookBar />
    </>
  );
}
