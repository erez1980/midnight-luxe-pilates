import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HealthDeclaration from './HealthDeclaration';
import '../site.css';

// Served from /health/, one level below the site root.
const root = `${import.meta.env.BASE_URL}../`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HealthDeclaration root={root} />
  </StrictMode>
);
