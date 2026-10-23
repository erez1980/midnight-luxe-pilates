import type { SiteContent } from './content';

// Structured data (JSON-LD) for the home pages, built from the same content
// the page renders so the two never drift apart. Injected at build time by
// scripts/prerender.mjs.

export const SITE_ORIGIN = 'https://rkpilatestudio.com';

// Rotem is a freelancer who comes to the client — a service-area business,
// so no street address (Google: hide the address of a service-area business).
export const AREAS_SERVED = {
  he: ['עמק יזרעאל', 'עפולה', 'הגלבוע'],
  en: ['Emek Izrael Valley', 'Afula', 'Gilboa'],
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
      areaServed: AREAS_SERVED[lang].map((name) => ({ '@type': 'AdministrativeArea', name })),
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
