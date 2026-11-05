import { StrictMode } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import Site from './Site';
import { HE } from './content';
import { EN } from './content.en';
import { homeStructuredData, faqPage, personAndBusiness, lessonBuilderApp, areaServed, SITE_ORIGIN } from './seo';
import { llmsTxt } from './llms';
import { INITIAL_EXERCISES } from '../data';
import { EXERCISE_DESCRIPTIONS } from './static/exerciseDescriptions';
import { APPARATUS, PUBLISH_CONDITION_TABLES, ExerciseIndexPage, ExercisePage, LandingPage, LegalDocumentPage, NotFoundPage, apparatusPath, exerciseSlug, exercisesForApparatus } from './static/StaticPages';
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

const pageRoot = (path: string) => '../'.repeat(path.split('/').filter(Boolean).length);

function exerciseMetaDescription(ex: (typeof INITIAL_EXERCISES)[number]) {
  const custom = EXERCISE_DESCRIPTIONS[ex.id];
  if (custom) return custom;
  const benefits = ex.benefits.replace(/[.\s]+$/, '');
  return `${benefits}. שלבי ביצוע, נשימה ושרירים עיקריים.`;
}

export function renderStaticPages(): StaticPage[] {
  const all = INITIAL_EXERCISES;
  const pages: StaticPage[] = [];

  for (const page of LANDINGS) {
    const path = `${page.slug}/`;
    const url = `${SITE_ORIGIN}/${path}`;
    const catalog = page.apparatus ? exercisesForApparatus(all, page.apparatus) : [];
    if (page.apparatus && catalog.length === 0) {
      throw new Error(`landing ${page.slug} lists no ${page.apparatus} exercises`);
    }
    const crumbs = [
      { name: 'דף הבית', url: `${SITE_ORIGIN}/` },
      ...(page.parent ? [{ name: page.parent.label, url: `${SITE_ORIGIN}/${page.parent.href}` }] : []),
      { name: page.h1 },
    ];
    pages.push({
      path,
      title: page.title,
      description: page.description,
      html: renderToStaticMarkup(<LandingPage page={page} all={all} root={pageRoot(path)} />),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...personAndBusiness(HE),
          {
            '@type': page.apparatus ? 'CollectionPage' : 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: page.h1,
            description: page.description,
            inLanguage: 'he-IL',
            isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
            about: { '@id': page.app ? `${SITE_ORIGIN}/app/#app` : `${SITE_ORIGIN}/#business` },
            ...(page.apparatus
              ? {
                  mainEntity: {
                    '@type': 'ItemList',
                    numberOfItems: catalog.length,
                    itemListElement: catalog.map((ex, i) => ({
                      '@type': 'ListItem',
                      position: i + 1,
                      name: ex.name,
                      url: `${SITE_ORIGIN}/exercises/${exerciseSlug(ex)}/`,
                    })),
                  },
                }
              : {}),
          },
          ...(page.app ? [lessonBuilderApp()] : []),
          ...(page.service
            ? [{
                '@type': 'Service',
                name: page.service.name,
                description: page.service.description,
                provider: { '@id': `${SITE_ORIGIN}/#business` },
                areaServed: areaServed('he'),
              }]
            : []),
          breadcrumbList(crumbs),
          faqPage(page.faq, url),
        ],
      },
    });
  }

  pages.push({
    path: 'exercises/',
    title: 'ספריית תרגילי פילאטיס: מזרן, כיסא ומכשירים | פילאטיס בתנועה',
    description:
      `ספריית תרגילי פילאטיס בעברית: מזרן, רפורמר, קדילק, כיסא ואביזרים. לכל תרגיל ביצוע, נשימה ושרירים עיקריים${PUBLISH_CONDITION_TABLES ? ', והתאמה לגב תחתון, הריון ואחרי לידה' : ''}.`,
    html: renderToStaticMarkup(<ExerciseIndexPage all={all} root={pageRoot('exercises/')} />),
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
          relatedLink: [
            `${SITE_ORIGIN}/exercises/mat/`,
            `${SITE_ORIGIN}/exercises/chair/`,
            `${SITE_ORIGIN}/pilates-pregnancy/`,
            `${SITE_ORIGIN}/pilates-postnatal/`,
          ],
        },
        breadcrumbList([{ name: 'דף הבית', url: `${SITE_ORIGIN}/` }, { name: 'ספריית תרגילים' }]),
      ],
    },
  });

  for (const ex of all) {
    const slug = exerciseSlug(ex);
    const url = `${SITE_ORIGIN}/exercises/${slug}/`;
    const apparatus = APPARATUS[ex.apparatus].label;
    const hubPath = apparatusPath(ex.apparatus);
    const description = exerciseMetaDescription(ex);
    pages.push({
      path: `exercises/${slug}/`,
      title: `${ex.name} | תרגיל פילאטיס ${apparatus}`,
      description,
      html: renderToStaticMarkup(<ExercisePage ex={ex} all={all} root={pageRoot(`exercises/${slug}/`)} />),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: ex.name,
            description,
            inLanguage: 'he-IL',
            isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
            mainEntity: { '@id': `${url}#exercise` },
          },
          {
            '@type': 'ExerciseAction',
            '@id': `${url}#exercise`,
            name: ex.name,
            alternateName: ex.englishName,
            description: ex.benefits,
            url,
            inLanguage: 'he-IL',
            instrument: { '@type': 'Thing', name: `פילאטיס ${apparatus}` },
          },
          {
            '@type': 'ExercisePlan',
            name: ex.name,
            alternateName: ex.englishName,
            description: ex.benefits,
            exerciseType: `פילאטיס ${apparatus}`,
            activityDuration: `PT${ex.durationMinutes}M`,
            url,
          },
          breadcrumbList([
            { name: 'דף הבית', url: `${SITE_ORIGIN}/` },
            { name: 'ספריית תרגילים', url: `${SITE_ORIGIN}/exercises/` },
            { name: apparatus, url: `${SITE_ORIGIN}/${hubPath}` },
            { name: ex.name },
          ]),
        ],
      },
    });
  }

  const legal = [
    {
      path: 'privacy/',
      kind: 'privacy' as const,
      title: 'מדיניות פרטיות | פילאטיס בתנועה',
      name: 'מדיניות פרטיות',
      description: 'מדיניות זו מסבירה איזה מידע פילאטיס בתנועה אוסף, איך הוא נשמר ולשם מה הוא משמש.',
    },
    {
      path: 'terms/',
      kind: 'terms' as const,
      title: 'תנאי שימוש | פילאטיס בתנועה',
      name: 'תנאי שימוש',
      description: 'הגלישה והשימוש ב-פילאטיס בתנועה מהווים הסכמה לתנאי שימוש אלו.',
    },
  ];
  for (const page of legal) {
    const url = `${SITE_ORIGIN}/${page.path}`;
    pages.push({
      path: page.path,
      title: page.title,
      description: page.description,
      html: renderToStaticMarkup(<LegalDocumentPage kind={page.kind} root={pageRoot(page.path)} />),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: page.name,
            description: page.description,
            inLanguage: 'he-IL',
            isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
          },
          breadcrumbList([
            { name: 'דף הבית', url: `${SITE_ORIGIN}/` },
            { name: page.name },
          ]),
        ],
      },
    });
  }

  return pages;
}

// The lesson builder's own page (/app/) is a client-rendered app; its
// structured data is added to the built HTML by scripts/prerender.mjs.
export function appStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [lessonBuilderApp(), ...personAndBusiness(HE)],
  };
}

export function renderLlmsTxt() {
  return llmsTxt(LANDINGS);
}

export function render404() {
  return renderToStaticMarkup(<NotFoundPage root="/" />);
}
