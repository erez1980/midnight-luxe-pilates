import { StrictMode } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import Site from './Site';
import { HE } from './content';
import { EN } from './content.en';
import { homeStructuredData, faqPage, personAndBusiness, SITE_ORIGIN } from './seo';
import { INITIAL_EXERCISES } from '../data';
import { APPARATUS, ExerciseIndexPage, ExercisePage, LandingPage, NotFoundPage, exerciseSlug } from './static/StaticPages';
import { LANDINGS } from './static/landings';

// Server entry used only at build time (scripts/prerender.mjs). The home
// pages are rendered to HTML that the client bundle hydrates; the extra pages
// are static markup with no JavaScript.

export function renderHome(lang: 'he' | 'en') {
  const content = lang === 'he' ? HE : EN;
  // Same props as main.tsx / main.en.tsx with the build's relative base.
  const root = lang === 'he' ? './' : './../';
  const html = renderToString(
    <StrictMode>
      <Site content={content} root={root} altUrl={lang === 'he' ? `${root}en/` : root} />
    </StrictMode>
  );
  return { html, jsonLd: homeStructuredData(content) };
}

const breadcrumbList = (items: { name: string; url?: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    ...(item.url ? { item: item.url } : {}),
  })),
});

export interface StaticPage {
  path: string; // output path relative to dist, e.g. 'exercises/the-hundred/'
  title: string;
  description: string;
  html: string;
  jsonLd: object;
  image?: string;
}

export function renderStaticPages(): StaticPage[] {
  const all = INITIAL_EXERCISES;
  const pages: StaticPage[] = [];

  for (const page of LANDINGS) {
    const url = `${SITE_ORIGIN}/${page.slug}/`;
    pages.push({
      path: `${page.slug}/`,
      title: page.title,
      description: page.description,
      html: renderToStaticMarkup(<LandingPage page={page} all={all} root="../" />),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...personAndBusiness(HE),
          {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: page.h1,
            inLanguage: 'he-IL',
            isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
            about: { '@id': `${SITE_ORIGIN}/#business` },
          },
          ...(page.service
            ? [{
                '@type': 'Service',
                name: page.service.name,
                description: page.service.description,
                provider: { '@id': `${SITE_ORIGIN}/#business` },
                areaServed: { '@type': 'AdministrativeArea', name: 'עמק יזרעאל' },
              }]
            : []),
          breadcrumbList([{ name: 'דף הבית', url: `${SITE_ORIGIN}/` }, { name: page.h1 }]),
          faqPage(page.faq, url),
        ],
      },
    });
  }

  pages.push({
    path: 'exercises/',
    title: `ספריית תרגילי פילאטיס: ${all.length} תרגילי מזרן, רפורמר ואביזרים | פילאטיס בתנועה`,
    description:
      'ספריית תרגילי פילאטיס בעברית: מזרן, רפורמר, קדילק, כיסא ואביזרים — הוראות ביצוע, נשימה, שרירים עיקריים והתאמה לגב תחתון, הריון ואחרי לידה.',
    html: renderToStaticMarkup(<ExerciseIndexPage all={all} root="../" />),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${SITE_ORIGIN}/exercises/#webpage`,
          url: `${SITE_ORIGIN}/exercises/`,
          name: 'ספריית תרגילי פילאטיס',
          inLanguage: 'he-IL',
          isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        },
        breadcrumbList([{ name: 'דף הבית', url: `${SITE_ORIGIN}/` }, { name: 'ספריית תרגילים' }]),
      ],
    },
  });

  for (const ex of all) {
    const slug = exerciseSlug(ex);
    const url = `${SITE_ORIGIN}/exercises/${slug}/`;
    const apparatus = APPARATUS[ex.apparatus].label;
    pages.push({
      path: `exercises/${slug}/`,
      title: `${ex.name} — תרגיל פילאטיס ${apparatus}: ביצוע, נשימה והתאמות`,
      description: `${ex.benefits} איך מבצעים את ${ex.englishName} שלב אחר שלב, נשימה, שרירים עיקריים והתאמה להריון, לגב תחתון ומצבים נוספים.`.slice(0, 300),
      html: renderToStaticMarkup(<ExercisePage ex={ex} all={all} root="../../" />),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: ex.name,
            description: ex.benefits,
            inLanguage: 'he-IL',
            isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
            about: { '@type': 'ExercisePlan', name: ex.englishName, alternateName: ex.name, exerciseType: `Pilates ${ex.apparatus}` },
          },
          breadcrumbList([
            { name: 'דף הבית', url: `${SITE_ORIGIN}/` },
            { name: 'ספריית תרגילים', url: `${SITE_ORIGIN}/exercises/` },
            { name: ex.name },
          ]),
        ],
      },
    });
  }

  return pages;
}

export function render404() {
  return renderToStaticMarkup(<NotFoundPage root="/" />);
}
