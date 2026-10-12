import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Site from './Site';
import { EN } from './content.en';
import './site.css';

// This page is served from /en/, one level below the site root. With the
// relative base ('./') that resolves back to the root; in dev ('/') the
// browser normalizes '/../' to '/'.
const root = `${import.meta.env.BASE_URL}../`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site content={EN} root={root} altUrl={root} />
  </StrictMode>,
);
