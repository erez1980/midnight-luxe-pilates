import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpLeft, ChevronLeft, ChevronRight, Globe, ArrowUpRight, Award, Building2, Check, HeartPulse, Library, ListOrdered, MapPin, Menu, Phone, Mail, PartyPopper, Play, Plus, Settings2, Shirt, Smartphone, Users, Wind, X } from 'lucide-react';
import { HE, type SiteContent } from './content';
import { STATIC_GALLERY } from './gallery';
import { fetchUploadedGallery, type GalleryItem } from '../utils/gallery';

// The site renders in one language per page (/ = Hebrew, /en/ = English).
// Everything language-specific comes from a SiteContent object; `root` is the
// path back to the site root, so assets and the /app/ link resolve from both.
const SiteContext = createContext<{ content: SiteContent; root: string; altUrl: string; gallery: GalleryItem[] }>({
  content: HE,
  root: import.meta.env.BASE_URL,
  altUrl: '',
  gallery: [],
});

type ContactAction = { href: string; external: boolean };

// One primary "book a class" action, picked from whatever contact details
// exist: WhatsApp beats phone beats email.
function primaryContact(contact: SiteContent['CONTACT'], subject: string, message: string): ContactAction {
  if (contact.whatsapp) {
    return {
      href: `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`,
      external: true,
    };
  }
  if (contact.phone) return { href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`, external: false };
  return {
    href: `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`,
    external: false,
  };
}

function useSite() {
  const { content, root, altUrl, gallery } = useContext(SiteContext);
  return useMemo(() => {
    const { CONTACT, UI } = content;
    const BOOK = primaryContact(CONTACT, UI.bookSubject, CONTACT.whatsappGreeting);
    // The gallery link only appears once there is something to show.
    const NAV_LINKS = gallery.length
      ? content.NAV_LINKS.flatMap((link) =>
          link.href === '#faq' ? [{ href: '#gallery', label: UI.galleryNav }, link] : [link]
        )
      : content.NAV_LINKS;
    return {
      ...content,
      NAV_LINKS,
      GALLERY: gallery,
      ASSET: root,
      ALT_URL: altUrl,
      APP_URL: `${root}app/`,
      EMBLEM_LIGHT: `${root}brand/emblem-light.webp`,
      EMBLEM_DARK: `${root}brand/emblem-dark.webp`,
      BOOK,
      SCHEDULE: primaryContact(CONTACT, UI.scheduleSubject, UI.scheduleGreeting),
      CONTACT_LABEL: CONTACT.whatsapp ? UI.contactLabels.whatsapp : CONTACT.phone ? UI.contactLabels.phone : UI.contactLabels.email,
      bookLinkProps: BOOK.external ? { target: '_blank', rel: 'noopener noreferrer' } : {},
    };
  }, [content, root, altUrl, gallery]);
}

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
  const { BOOK, bookLinkProps } = useSite();
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
  const { ASSET, EMBLEM_LIGHT, EMBLEM_DARK } = useSite();
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

// Drawn as SVG: flag emoji don't render on Windows (they show as letters).
function FlagIL({ className = 'h-3.5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={`${className} rounded-[2px] ring-1 ring-black/10`} aria-hidden="true">
      <rect width="220" height="160" fill="#fff" />
      <rect y="15" width="220" height="25" fill="#0038b8" />
      <rect y="120" width="220" height="25" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="5.5">
        <path d="M110 50 136 95H84Z" />
        <path d="M110 110 84 65h52Z" />
      </g>
    </svg>
  );
}

function FlagUS({ className = 'h-3.5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 76 40" className={`${className} rounded-[2px] ring-1 ring-black/10`} aria-hidden="true">
      <rect width="76" height="40" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 40) / 13} width="76" height={40 / 13} fill="#b22234" />
      ))}
      <rect width="30.4" height={(7 * 40) / 13} fill="#3c3b6e" />
      <g fill="#fff">
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3, 4].map((c) => <circle key={`${r}-${c}`} cx={3.5 + c * 5.9} cy={3.6 + r * 6.4} r="1.1" />)
        )}
      </g>
    </svg>
  );
}

// Language switcher. The visitor's explicit choice is remembered and always
// beats the automatic detection in index.html.
function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, ALT_URL, UI } = useSite();
  const choose = (target: 'he' | 'en') => {
    try {
      localStorage.setItem('site-lang', target);
    } catch {
      // Storage blocked: the switch still works for this visit.
    }
    if (target !== lang) window.location.href = ALT_URL + window.location.hash;
  };
  const options = [
    { id: 'he' as const, label: 'עב', name: 'עברית', Flag: FlagIL },
    { id: 'en' as const, label: 'EN', name: 'English', Flag: FlagUS },
  ];
  return (
    <div role="group" aria-label={UI.language} className="inline-flex shrink-0 rounded-full border border-line bg-ivory/70 p-0.5">
      {options.map(({ id, label, name, Flag }) => (
        <button
          key={id}
          type="button"
          lang={id}
          aria-pressed={lang === id}
          aria-label={name}
          title={name}
          onClick={() => choose(id)}
          className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs transition-colors ${
            lang === id ? 'bg-sage-soft font-medium text-sage-deep' : 'text-muted hover:text-ink'
          }`}
        >
          <Flag />
          {!compact && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const instagramHandle = (url: string) => `@${url.replace(/\/+$/, '').split('/').pop()}`;

// WhatsApp / email / Instagram (and optionally the website) as labelled
// links, so people can reach Rotem on whichever channel they prefer.
type Channel = 'whatsapp' | 'email' | 'instagram' | 'website';

function ContactChannels({
  tone = 'light',
  channels = ['whatsapp', 'email', 'instagram'],
}: {
  tone?: 'light' | 'dark';
  channels?: Channel[];
}) {
  const { CONTACT, UI } = useSite();
  const show = (c: Channel) => channels.includes(c);
  const items = [
    show('whatsapp') && CONTACT.whatsapp && {
      href: `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappGreeting)}`,
      label: UI.channels.whatsapp,
      icon: <WhatsAppIcon className="h-4 w-4" />,
    },
    show('email') && CONTACT.email && { href: `mailto:${CONTACT.email}`, label: CONTACT.email, icon: <Mail className="h-4 w-4" aria-hidden="true" />, ltr: true },
    show('instagram') && CONTACT.instagram && { href: CONTACT.instagram, label: instagramHandle(CONTACT.instagram), icon: <InstagramIcon className="h-4 w-4" />, ltr: true },
    show('website') && CONTACT.website && { href: CONTACT.website, label: displayUrl(CONTACT.website), icon: <Globe className="h-4 w-4" aria-hidden="true" />, ltr: true },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; ltr?: boolean }[];
  const pill =
    tone === 'dark'
      ? 'border-cream/20 text-cream/85 hover:border-gold hover:text-gold'
      : 'border-line bg-white/70 text-ink hover:border-sage hover:text-sage';
  return (
    <ul className={`flex flex-wrap gap-2 ${tone === 'dark' ? 'justify-center' : ''}`}>
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            target={item.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${pill}`}
          >
            {item.icon}
            <span dir={item.ltr ? 'ltr' : undefined}>{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

// ---------- sections ----------

function Header() {
  const { BRAND, NAV_LINKS, APP_PROMO, UI, APP_URL, EMBLEM_LIGHT, BOOK, CONTACT_LABEL, bookLinkProps } = useSite();
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
        <a href="#top" className="flex items-center gap-3" aria-label={`${BRAND.name} — ${UI.toTop}`}>
          <img src={EMBLEM_LIGHT} alt="" className="h-9 w-auto" />
          <span className="whitespace-nowrap font-display text-xl font-medium text-gold-deep">{BRAND.name}</span>
        </a>

        <nav className="hidden items-center gap-7 xl:flex" aria-label={UI.mainNav}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="whitespace-nowrap text-[15px] text-muted transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>

        {/* The lesson builder is reached via the "for instructors" section
            (and the mobile menu), which keeps the desktop bar on one line. */}
        <div className="hidden items-center gap-3 xl:flex">
          <LangSwitch />
          <a
            href={BOOK.href}
            {...bookLinkProps}
            className="whitespace-nowrap rounded-full bg-sage px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-deep"
          >
            {CONTACT_LABEL}
          </a>
        </div>

        <div className="flex items-center gap-1 xl:hidden">
        <LangSwitch compact />
        <button ref={menuButtonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-me-2 flex h-11 w-11 items-center justify-center rounded-full text-ink"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? UI.closeMenu : UI.openMenu}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-72px)] overflow-y-auto bg-ivory px-6 pb-10 pt-6 xl:hidden">
          <nav className="flex flex-col" aria-label={UI.mainNav}>
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
  const { BRAND, PHOTOS, HERO, UI, APP_URL } = useSite();
  return (
    <section id="top" className="relative overflow-hidden pt-[72px]">
      {/* Soft ambient light — the "breathing" studio feel. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="breathe absolute -top-32 left-[-10%] h-[520px] w-[520px] rounded-full bg-sage-light/25 blur-3xl" />
        <div className="breathe absolute bottom-[-20%] right-[-8%] h-[460px] w-[460px] rounded-full bg-gold-soft/40 blur-3xl [animation-delay:-5s]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-[1240px] items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-20">
        <div>
          {HERO.instructorPill && (
            <Reveal>
              <a
                href={APP_URL}
                className="group mb-8 inline-flex items-center gap-3 rounded-full border border-sage/40 bg-ivory/80 py-1.5 pe-4 ps-1.5 text-sm text-ink shadow-[0_8px_24px_-16px_rgba(76,92,66,0.6)] backdrop-blur transition-all duration-500 ease-soft hover:-translate-y-0.5 hover:border-sage hover:bg-sage-soft"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1 text-xs font-medium text-white">
                  <ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />
                  {HERO.instructorPill.label}
                </span>
                <span className="font-medium">{HERO.instructorPill.text}</span>
                <ChevronLeft className="h-4 w-4 text-sage transition-transform duration-500 ease-soft group-hover:-translate-x-1" aria-hidden="true" />
              </a>
            </Reveal>
          )}
          <Reveal>
            {/* The eyebrow is its own paragraph, outside the H1, so crawlers
                don't glue its last word to the heading's first. The big lines
                are separated by real spaces for the same reason. */}
            <p className="flex items-center gap-3 text-sm font-medium text-gold-deep">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              {HERO.eyebrow}
            </p>
            <h1 className="mt-6 font-display text-[clamp(3.2rem,9vw,6.5rem)] font-light leading-[0.98] tracking-tight text-ink">
              {HERO.title.map((line, i) => (
                <React.Fragment key={line}>
                  {i > 0 && ' '}
                  <span className={`block ${i === HERO.title.length - 1 ? 'text-sage' : ''}`}>{line}</span>
                </React.Fragment>
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
                data-hero-book
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-7 py-3.5 text-base font-medium text-white shadow-[0_10px_30px_-12px_rgba(76,92,66,0.55)] transition-all duration-500 ease-soft hover:-translate-y-0.5 hover:bg-sage-deep"
              >
                {HERO.primaryCta}
              </a>
              <a
                href={HERO.secondaryHref === 'app' ? APP_URL : HERO.secondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sage/60 px-7 py-3.5 text-base text-sage transition-colors hover:border-sage hover:bg-sage-soft"
              >
                {HERO.secondaryHref === 'app' && <ListOrdered className="h-4 w-4" aria-hidden="true" />}
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
          <div className="absolute -bottom-6 start-4 rounded-2xl border border-line bg-ivory/95 px-5 py-4 shadow-[0_20px_40px_-24px_rgba(46,49,40,0.4)] backdrop-blur md:start-[-2rem]">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <Award className="h-4 w-4 text-gold-deep" aria-hidden="true" />
              {UI.heroBadgeTitle}
            </p>
            <p className="mt-1 text-xs text-muted">{UI.heroBadgeSub}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Ticker() {
  const { PRINCIPLES_TICKER } = useSite();
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

// Diploma cards; the full certificate opens in the shared lightbox.
function Certificates() {
  const { CERTIFICATES, UI, ASSET } = useSite();
  const [open, setOpen] = useState<number | null>(null);
  if (CERTIFICATES.length === 0) return null;
  const items: GalleryItem[] = CERTIFICATES.map((c) => ({
    id: c.id,
    url: `${ASSET}${c.image}`,
    kind: 'image',
    caption_he: `${c.title} · ${c.details}`,
    caption_en: `${c.title} · ${c.details}`,
  }));
  return (
    <Reveal delay={480}>
      <div className="mt-10 border-t border-line pt-8">
        <h3 className="text-sm font-medium text-gold-deep">
          {UI.certificatesTitle} · {UI.certificatesIssuer}
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CERTIFICATES.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-white/60 p-3 text-start transition-colors hover:border-gold/60"
              >
                <img src={`${ASSET}${c.thumb}`} alt={`${UI.certificateAlt}: ${c.title} · ${UI.certificatesIssuer}`} loading="lazy" width={96} height={64} className="h-16 w-24 shrink-0 rounded-lg object-cover ring-1 ring-line" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{c.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{c.details}</span>
                  <span className="mt-1 block text-xs text-sage underline decoration-gold/50 underline-offset-4 group-hover:decoration-sage">
                    {UI.certificateView}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open !== null && <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Reveal>
  );
}

function About() {
  const { BRAND, PHOTOS, ABOUT, UI } = useSite();
  return (
    <section id="about" className="relative py-24 md:py-36">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <Reveal className="relative mx-auto w-full max-w-[400px] lg:order-none">
          <ArchPhoto src={PHOTOS.about} alt={BRAND.photoAlt} tone="dark" className="aspect-[4/5] w-full" />
          <div className="absolute -bottom-5 -end-5 hidden h-28 w-28 rounded-full border border-gold/60 md:block" aria-hidden="true" />
        </Reveal>

        <div>
          <Reveal>
            <Eyebrow>{UI.aboutEyebrow}</Eyebrow>
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
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 text-sm text-ink">
                <Award className="h-4 w-4 text-gold-deep" aria-hidden="true" />
                {BRAND.certification}
              </span>
            </div>
          </Reveal>
          <Certificates />
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
  const { CLASSES, AUDIENCE, UI } = useSite();
  return (
    <section id="classes" className="bg-sand py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{UI.classesEyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">{UI.classesTitle}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {UI.classesIntro}
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
              {UI.audienceTitle}{' '}
              <span className="mt-2 block">{UI.audienceSub}</span>
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
  const { CONTACT, PRICING, UI, BOOK, SCHEDULE } = useSite();
  return (
    <section id="pricing" className="py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{UI.pricingEyebrow}</Eyebrow>
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
                    <span className="absolute -top-3.5 start-8 rounded-full bg-gold px-4 py-1 text-xs font-medium text-night">
                      {UI.pricingFeatured}
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
  brand: Shirt,
  event: PartyPopper,
  studio: Building2,
  private: Users,
};

// Builds a ready-to-send WhatsApp (or email) message from the form, so an
// inquiry reaches Rotem with every detail she needs to answer it.
function BookingForm() {
  const { CONTACT, BOOKING, UI } = useSite();
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
      UI.message.hello,
      `${UI.message.request} ${option?.title ?? ''}`,
      name && `${UI.message.name} ${name}`,
      date && `${UI.message.date} ${date}`,
      place && `${UI.message.place} ${place}`,
      participants && `${UI.message.participants} ${participants}`,
      notes && `${UI.message.notes} ${notes}`,
    ].filter(Boolean);
    const text = lines.join('\n');
    const url = CONTACT.whatsapp
      ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`
      : `mailto:${CONTACT.email}?subject=${encodeURIComponent(option?.title ?? UI.message.fallbackSubject)}&body=${encodeURIComponent(text)}`;
    // Lead event: channel and service type only, none of the form's contents.
    window.gtag?.('event', 'generate_lead', { method: CONTACT.whatsapp ? 'whatsapp' : 'email', service: type });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const field =
    'mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-ink placeholder:text-muted/70 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20';

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-line bg-ivory p-6 md:p-10">
      <h3 className="font-display text-2xl md:text-3xl">{BOOKING.form.title}</h3>
      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-ink">{UI.form.typeLegend}</legend>
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
          {UI.form.name}
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="block text-sm font-medium text-ink">
          {UI.form.date}
          <input className={field} value={date} onChange={(e) => setDate(e.target.value)} placeholder={UI.form.datePlaceholder} />
        </label>
        <label className="block text-sm font-medium text-ink">
          {UI.form.place}
          <input className={field} value={place} onChange={(e) => setPlace(e.target.value)} placeholder={UI.form.placePlaceholder} />
        </label>
        <label className="block text-sm font-medium text-ink">
          {UI.form.participants}
          <input className={field} value={participants} onChange={(e) => setParticipants(e.target.value)} inputMode="numeric" placeholder={UI.form.participantsPlaceholder} />
        </label>
      </div>
      <label className="mt-5 block text-sm font-medium text-ink">
        {UI.form.notes}
        <textarea className={`${field} min-h-24 resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={UI.form.notesPlaceholder} />
      </label>
      <button
        type="submit"
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage px-7 py-3.5 font-medium text-white transition-colors hover:bg-sage-deep sm:w-auto"
      >
        {CONTACT.whatsapp ? <WhatsAppIcon /> : <Mail className="h-5 w-5" aria-hidden="true" />}
        {CONTACT.whatsapp ? BOOKING.form.submit : UI.form.submitEmail}
      </button>
      <p className="mt-3 text-sm text-muted">{BOOKING.form.note}</p>
    </form>
  );
}

function Booking() {
  const { BOOKING, UI, ASSET } = useSite();
  return (
    <section id="book" className="py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{UI.bookingEyebrow}</Eyebrow>
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
                  {o.more && (
                    <a href={`${ASSET}${o.more}`} className="mt-6 inline-flex items-center gap-1.5 self-start py-1 text-sm font-medium text-sage underline decoration-gold/50 underline-offset-4 hover:decoration-sage">
                      {UI.bookingMore}
                      <ArrowUpLeft className="h-3.5 w-3.5 ltr:-scale-x-100" aria-hidden="true" />
                    </a>
                  )}
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
  { name: 'Cat Stretch', status: 'suitable', tone: 'bg-sage-soft text-sage-deep' },
  { name: 'The Hundred', status: 'modify', tone: 'bg-gold-soft/60 text-gold-deep' },
  { name: 'Swan Dive', status: 'avoid', tone: 'bg-red-100 text-red-800' },
] as const;

function Tool() {
  const { TOOL, UI, APP_URL, ASSET } = useSite();
  return (
    <section id="tool" className="bg-sand py-24 md:py-36">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>{UI.toolEyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">{TOOL.title}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">{TOOL.intro}</p>
            {UI.toolLanguageNote && <p className="mt-3 text-sm text-gold-deep">{UI.toolLanguageNote}</p>}
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
              <ArrowUpLeft className="h-4 w-4 ltr:-scale-x-100" aria-hidden="true" />
            </a>
            <a href={`${ASSET}exercises/`} className="mt-10 ms-2 inline-flex items-center px-4 py-3.5 text-sage underline decoration-gold/50 underline-offset-4 hover:decoration-sage">
              {UI.exerciseLibraryLink}
            </a>
          </Reveal>
        </div>

        <Reveal delay={160} className="mx-auto w-full max-w-[420px]">
          <figure className="rounded-[28px] border border-line bg-ivory p-6 shadow-[0_40px_80px_-48px_rgba(46,49,40,0.5)]">
            <figcaption className="flex items-center justify-between text-sm text-muted">
              <span>{UI.toolPreviewCaption}</span>
              <span className="rounded-full border border-line px-3 py-1 text-xs">{UI.toolPreviewTag}</span>
            </figcaption>
            <ul className="mt-5 space-y-3">
              {TOOL_PREVIEW.map((row) => (
                <li key={row.name} className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3">
                  <span dir="ltr" className="font-medium text-ink">{row.name}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${row.tone}`}>{UI.toolPreviewStatus[row.status]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-muted">{UI.toolDisclaimer}</p>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

// Full-screen viewer. Gets its own history entry so the phone's back button
// closes it; arrow keys / buttons move between items, Escape closes.
function Lightbox({ items, index, onIndex, onClose }: { items: GalleryItem[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { UI, lang } = useSite();
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const prev = () => onIndex((index - 1 + items.length) % items.length);
  const next = () => onIndex((index + 1) % items.length);

  useEffect(() => {
    window.history.pushState({ ...(window.history.state ?? {}), lightbox: true }, '');
    const onPop = () => onClose();
    window.addEventListener('popstate', onPop);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('popstate', onPop);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.history.back();
      // In RTL the "next" item sits to the left.
      if (e.key === 'ArrowLeft') (lang === 'he' ? next : prev)();
      if (e.key === 'ArrowRight') (lang === 'he' ? prev : next)();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const caption = lang === 'he' ? item.caption_he : item.caption_en || item.caption_he;
  const navBtn = 'flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20';
  return (
    <div role="dialog" aria-modal="true" aria-label={caption || UI.galleryTitle} className="fixed inset-0 z-[70] flex flex-col bg-night/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 text-cream/80">
        <span className="text-sm" dir="ltr">
          {index + 1} / {items.length}
        </span>
        <button ref={closeRef} type="button" onClick={() => window.history.back()} aria-label={UI.galleryClose} className={navBtn}>
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
        {item.kind === 'video' ? (
          <video key={item.url} src={item.url} controls autoPlay playsInline className="max-h-full max-w-full rounded-xl" />
        ) : (
          <img key={item.url} src={item.url} alt={caption} className="max-h-full max-w-full rounded-xl object-contain" />
        )}
        {items.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label={UI.galleryPrev} className={`${navBtn} absolute start-4 top-1/2 -translate-y-1/2`}>
              <ChevronRight className="h-6 w-6 ltr:-scale-x-100" />
            </button>
            <button type="button" onClick={next} aria-label={UI.galleryNext} className={`${navBtn} absolute end-4 top-1/2 -translate-y-1/2`}>
              <ChevronLeft className="h-6 w-6 ltr:-scale-x-100" />
            </button>
          </>
        )}
      </div>
      {caption && <p className="px-6 pb-6 text-center text-cream/85">{caption}</p>}
    </div>
  );
}

function Gallery() {
  const { GALLERY, UI, lang } = useSite();
  const [open, setOpen] = useState<number | null>(null);
  if (GALLERY.length === 0) return null;
  return (
    <section id="gallery" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{UI.galleryEyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">{UI.galleryTitle}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">{UI.galleryIntro}</p>
          </Reveal>
        </div>
        <ul className="mt-12 columns-2 gap-3 md:columns-3 md:gap-4">
          {GALLERY.map((item, i) => {
            const caption = lang === 'he' ? item.caption_he : item.caption_en || item.caption_he;
            return (
              <li key={item.id} className="mb-3 break-inside-avoid md:mb-4">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={caption || UI.galleryOpen}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-sand"
                >
                  {item.kind === 'video' ? (
                    <>
                      <video src={`${item.url}#t=0.1`} muted playsInline preload="metadata" className="block w-full" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-night/60 text-white backdrop-blur">
                          <Play className="h-6 w-6" aria-hidden="true" />
                        </span>
                      </span>
                    </>
                  ) : (
                    <img src={item.url} alt={caption} loading="lazy" className="block w-full transition-transform duration-700 ease-soft group-hover:scale-[1.03]" />
                  )}
                  {caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 to-transparent px-4 pb-3 pt-8 text-start text-sm text-cream opacity-0 transition-opacity group-hover:opacity-100">
                      {caption}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {open !== null && <Lightbox items={GALLERY} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Method() {
  const { PRINCIPLES, UI, EMBLEM_DARK } = useSite();
  return (
    <section id="method" className="relative overflow-hidden bg-night py-24 text-cream md:py-36">
      <img
        src={EMBLEM_DARK}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -end-40 top-1/2 w-[720px] max-w-none -translate-y-1/2 opacity-[0.07]"
      />
      <div className="relative mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow tone="dark">{UI.methodEyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">
              {UI.methodTitle[0]}{' '}
              <span className="block">{UI.methodTitle[1]}</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-cream/70">
              {UI.methodIntro}
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
  const { LOCATIONS, UI, SCHEDULE, bookLinkProps } = useSite();
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
                {LOCATIONS.areas.length > 0 && <p className="mt-4 font-medium">{UI.locationsAreas} {LOCATIONS.areas.join(' · ')}</p>}
                {LOCATIONS.studios.length > 0 && <ul className="mt-4 space-y-2">{LOCATIONS.studios.map((studio) => <li key={studio.name}>{UI.locationsTeachesAt} {studio.name}{studio.address && ` · ${studio.address}`}{studio.url && <a href={studio.url} target="_blank" rel="noopener noreferrer" className="ms-3 underline">פרטי הסטודיו</a>}</li>)}</ul>}
                {LOCATIONS.comingSoon && <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white/70 px-4 py-2 text-sm text-gold-deep">
                  <span className="h-2 w-2 rounded-full bg-gold breathe" aria-hidden="true" />
                  {LOCATIONS.comingSoon}
                </p>}
              </div>
              <a href={LOCATIONS.scheduleUrl || SCHEDULE.href} {...(LOCATIONS.scheduleUrl ? { target: '_blank', rel: 'noopener noreferrer' } : bookLinkProps)} className="inline-flex items-center justify-center rounded-full bg-sage px-7 py-3.5 text-white hover:bg-sage-deep focus-visible:outline-2">
                {LOCATIONS.scheduleUrl ? UI.locationsSchedule : UI.locationsRequest}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Testimonials() {
  const { TESTIMONIALS, UI } = useSite();
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section className="bg-sand py-24 md:py-32" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <Reveal>
          <Eyebrow>{UI.testimonialsEyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h2 id="testimonials-title" className="mt-5 font-display text-4xl font-light md:text-6xl">
            {UI.testimonialsTitle}
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
  const { FAQ, UI, BOOK, bookLinkProps } = useSite();
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>{UI.faqEyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight md:text-6xl">{UI.faqTitle}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {UI.faqNotFound}{' '}
              <a href={BOOK.href} {...bookLinkProps} className="text-sage underline decoration-gold/60 underline-offset-4 hover:decoration-sage">
                {UI.faqWriteMe}
              </a>{' '}
              {UI.faqHappyToHelp}
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
                <p className={`max-w-2xl leading-relaxed text-muted ${item.contact ? 'pb-4' : 'pb-7'}`}>{item.a}</p>
                {item.contact && (
                  <div className="pb-7">
                    <ContactChannels />
                  </div>
                )}
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { CONTACT, UI, EMBLEM_DARK, CONTACT_LABEL } = useSite();
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
              {UI.contactTitle[0]}{' '}
              <span className="block text-gold">{UI.contactTitle[1]}</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/70">
              {UI.contactIntro}
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
          <Reveal delay={400}>
            <div className="mt-10">
              {/* WhatsApp, phone and email have their own buttons above. */}
              <ContactChannels tone="dark" channels={['instagram', 'website']} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { BRAND, CONTACT, NAV_LINKS, FOOTER_PAGES, APP_PROMO, UI, APP_URL, EMBLEM_LIGHT, ASSET } = useSite();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-12 pb-28 md:flex-row md:items-center md:justify-between md:px-8 md:pb-12">
        <a href="#top" className="flex items-center gap-3">
          <img src={EMBLEM_LIGHT} alt="" className="h-10 w-auto" />
          <span className="font-display text-xl text-gold-deep">{BRAND.name}</span>
        </a>
        <nav className="flex flex-wrap gap-x-6 text-sm text-muted [&>a]:py-1.5" aria-label={UI.footerNav}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
          <a href={APP_URL} className="hover:text-ink">
            {APP_PROMO.navigationLabel}
          </a>
          {FOOTER_PAGES.map((page) => (
            <a key={page.href} href={`${ASSET}${page.href}`} className="hover:text-ink">
              {page.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-1 text-sm text-muted md:items-end [&_a]:py-1.5">
          <div className="flex gap-4">
            <a href={`${APP_URL}?page=privacy`} className="hover:text-ink">
              {UI.privacy}
            </a>
            <a href={`${APP_URL}?page=terms`} className="hover:text-ink">
              {UI.terms}
            </a>
          </div>
          {CONTACT.instagram && (
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-ink">
              <InstagramIcon className="h-4 w-4" />
              <span dir="ltr">{instagramHandle(CONTACT.instagram)}</span>
            </a>
          )}
          {CONTACT.website && (
            <a href={CONTACT.website} className="inline-flex items-center gap-2 whitespace-nowrap hover:text-ink">
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr">{displayUrl(CONTACT.website)}</span>
            </a>
          )}
          <p>
            © {new Date().getFullYear()} {BRAND.name}. {UI.footerSignoff} {BRAND.owner}.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Mobile-only sticky CTA that appears once the hero's own buttons scroll away.
function MobileBookBar() {
  const { CONTACT_LABEL } = useSite();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 600;
      const heroButton = document.querySelector('[data-hero-book]');
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

function Page() {
  const { SHOW_PRICING, SHOW_LOCATIONS, UI } = useSite();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory"
      >
        {UI.skipToContent}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Ticker />
        <About />
        <Classes />
        <Gallery />
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

// `root`: path from this page to the site root ('./' for Hebrew, '../' from
// /en/). `altUrl`: the same page in the other language, for the switcher.
export default function Site({ content, root, altUrl }: { content: SiteContent; root: string; altUrl: string }) {
  const [uploaded, setUploaded] = useState<GalleryItem[]>([]);
  useEffect(() => {
    fetchUploadedGallery().then(setUploaded);
  }, []);
  const gallery = useMemo(
    () => [...STATIC_GALLERY.map((item) => ({ ...item, url: item.url.startsWith('http') ? item.url : `${root}${item.url}` })), ...uploaded],
    [uploaded, root]
  );
  const value = useMemo(() => ({ content, root, altUrl, gallery }), [content, root, altUrl, gallery]);
  return (
    <SiteContext.Provider value={value}>
      <Page />
    </SiteContext.Provider>
  );
}
