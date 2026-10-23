import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Site from './Site';
import { EN } from './content.en';
import './site.css';

// This page is served from /en/, one level below the site root. With the
// relative base ('./') that resolves back to the root; in dev ('/') the
// browser normalizes '/../' to '/'.
const root = `${import.meta.env.BASE_URL}../`;

// The production build pre-renders the page into #root (scripts/prerender.mjs);
// in dev the root is empty and React renders from scratch.
const container = document.getElementById('root')!;
const page = (
  <StrictMode>
    <Site content={EN} root={root} altUrl={root} />
  </StrictMode>
);
if (container.hasChildNodes()) hydrateRoot(container, page);
else createRoot(container).render(page);
