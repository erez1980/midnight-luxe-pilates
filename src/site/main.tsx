import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Site from './Site';
import { HE } from './content';
import './site.css';

const root = import.meta.env.BASE_URL;

// The production build pre-renders the page into #root (scripts/prerender.mjs);
// in dev the root is empty and React renders from scratch.
const container = document.getElementById('root')!;
const page = (
  <StrictMode>
    <Site content={HE} root={root} altUrl={`${root}en/`} />
  </StrictMode>
);
if (container.hasChildNodes()) hydrateRoot(container, page);
else createRoot(container).render(page);
