import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Site from './Site';
import { HE } from './content';
import './site.css';

const root = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site content={HE} root={root} altUrl={`${root}en/`} />
  </StrictMode>,
);
