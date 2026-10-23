import type { SiteContent } from './content';

// Structured data (JSON-LD) for the home pages, built from the same content
// the page renders so the two never drift apart. Injected at build time by
// scripts/prerender.mjs.

export const SITE_ORIGIN = 'https://rkpilatestudio.com';

// Rotem is a freelancer who comes to the client — a service-area business,
// so no street address (Google: hide the address of a service-area business).
export const AREAS_SERVED = {
  he: ['עמק יזרעאל', 'עפולה', 'הגלבוע', 'נצרת', 'בית שאן', 'מגדל העמק', 'רמת ישי', 'קריית טבעון', 'יקנעם'],
  en: ['Emek Izrael Valley', 'Afula', 'Gilboa', 'Nazareth', 'Beit She\'an', 'Migdal HaEmek', 'Ramat Yishai', 'Kiryat Tiv\'on', 'Yokneam'],
};

// The wider region the areas sit in, so "northern Israel" searches match.
export const REGION = { he: 'צפון הארץ', en: 'Northern Israel' };

export const areaServed = (lang: 'he' | 'en') =>
  AREAS_SERVED[lang].map((name) => ({
    '@type': 'AdministrativeArea',
    name,
    containedInPlace: { '@type': 'AdministrativeArea', name: REGION[lang], containedInPlace: { '@type': 'Country', name: 'Israel' } },
  }));

// Topics an assistant can match Rotem and the business to.
const KNOWS_ABOUT = {
  he: ['פילאטיס', 'פילאטיס מזרן', 'פילאטיס מכשירים', 'רפורמר', 'פילאטיס לאירועים', 'פילאטיס בהריון ואחרי לידה', 'בניית שיעורי פילאטיס'],
  en: ['Pilates', 'Mat Pilates', 'Apparatus Pilates', 'Reformer Pilates', 'Pilates for events', 'Prenatal and postnatal Pilates', 'Pilates lesson planning'],
};

const id = (fragment: string) => `${SITE_ORIGIN}/#${fragment}`;

export function personAndBusiness(content: SiteContent) {
  const lang = content.lang as 'he' | 'en';
  const { BRAND, CONTACT, CERTIFICATES, UI } = content;
  const sameAs = [CONTACT.instagram].filter(Boolean);
  const phone = `+${CONTACT.whatsapp.replace(/^\+/, '')}`.replace(/^\+972(\d{2})(\d{3})(\d{4})$/, '+972-$1-$2-$3');
  return [
    {
      '@type': 'Person',
      '@id': id('rotem'),
      name: BRAND.fullName,
      alternateName: lang === 'he' ? ['רתם', 'Rotem Shapira'] : ['Rotem', 'רתם שפירא'],
      jobTitle: lang === 'he' ? 'מדריכת פילאטיס מזרן ומכשירים' : 'Mat and apparatus Pilates instructor',
      image: `${SITE_ORIGIN}/photos/rotem.webp`,
      url: lang === 'he' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/en/`,
      knowsLanguage: ['he', 'en'],
      knowsAbout: KNOWS_ABOUT[lang],
      homeLocation: { '@type': 'Place', name: lang === 'he' ? 'עמק יזרעאל, צפון הארץ' : 'Emek Izrael Valley, Northern Israel' },
      sameAs,
      worksFor: { '@id': id('business') },
      hasCredential: CERTIFICATES.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: `${c.title} (${c.details})`,
        credentialCategory: lang === 'he' ? 'תעודת הסמכה' : 'Certificate',
        image: `${SITE_ORIGIN}/${c.image}`,
        recognizedBy: { '@type': 'Organization', name: UI.certificatesIssuer },
      })),
    },
    {
      '@type': 'ProfessionalService',
      '@id': id('business'),
      name: BRAND.name,
      alternateName: lang === 'he' ? ['Pilates in Motion'] : ['פילאטיס בתנועה'],
      description: content.HERO.subtitle,
      url: lang === 'he' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/en/`,
      image: `${SITE_ORIGIN}/${lang === 'he' ? 'og-image.jpg' : 'og-image-en.jpg'}`,
      logo: `${SITE_ORIGIN}/pwa-512.png`,
      telephone: phone,
      email: CONTACT.email,
      address: {
        '@type': 'PostalAddress',
        addressRegion: AREAS_SERVED[lang][0],
        addressCountry: 'IL',
      },
      areaServed: areaServed(lang),
      knowsAbout: KNOWS_ABOUT[lang],
      founder: { '@id': id('rotem') },
      employee: { '@id': id('rotem') },
      sameAs,
      knowsLanguage: ['he', 'en'],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: content.BOOKING.title,
        itemListElement: content.BOOKING.options.map((o) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: o.title, description: o.text },
        })),
      },
    },
  ];
}

// The lesson builder at /app/ — a web app for Pilates instructors (Hebrew).
export function lessonBuilderApp() {
  return {
    '@type': 'WebApplication',
    '@id': `${SITE_ORIGIN}/app/#app`,
    name: 'פילאטיס בתנועה — כלי לבניית שיעורי פילאטיס',
    alternateName: ['Pilates lesson builder', 'בניית שיעורי פילאטיס', 'מערך שיעור פילאטיס'],
    url: `${SITE_ORIGIN}/app/`,
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Pilates lesson planning',
    operatingSystem: 'Web, iOS, Android',
    inLanguage: 'he-IL',
    audience: { '@type': 'Audience', audienceType: 'מדריכות ומדריכי פילאטיס' },
    description:
      'כלי עבודה למדריכות ומדריכי פילאטיס: מאגר של מאות תרגילי מזרן ומכשירים, בניית מערך שיעור, מצב הדרכה חי מהטלפון, והתאמה לפציעות ולמצבים מיוחדים כמו גב תחתון, הריון ואחרי לידה.',
    featureList: [
      'מאגר תרגילי פילאטיס מזרן, רפורמר, קדילק, כיסא ואביזרים',
      'בניית מערך שיעור: חימום, גוף השיעור ושחרור',
      'סימון לכל תרגיל: מתאים, בהתאמה או להימנע, לפי מצב',
      'מצב הדרכה חי עם טיימר',
      'שמירה, סנכרון לענן ושיתוף שיעורים',
    ],
    publisher: { '@id': id('business') },
    creator: { '@id': id('business') },
  };
}

export function faqPage(faq: { q: string; a: string }[], url: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a.replace(/:$/, '.') },
    })),
  };
}

export function homeStructuredData(content: SiteContent) {
  const lang = content.lang as 'he' | 'en';
  const url = lang === 'he' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/en/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: `${SITE_ORIGIN}/`,
        name: lang === 'he' ? 'פילאטיס בתנועה' : 'Pilates in Motion',
        alternateName: ['פילאטיס בתנועה', 'Pilates in Motion', 'RK Pilates'],
        inLanguage: ['he-IL', 'en'],
        publisher: { '@id': id('business') },
      },
      ...personAndBusiness(content),
      lessonBuilderApp(),
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: content.BRAND.name,
        inLanguage: lang === 'he' ? 'he-IL' : 'en',
        isPartOf: { '@id': id('website') },
        about: { '@id': id('business') },
        primaryImageOfPage: `${SITE_ORIGIN}/${lang === 'he' ? 'og-image.jpg' : 'og-image-en.jpg'}`,
      },
      faqPage(content.FAQ, url),
    ],
  };
}
