/// <reference types="vite/client" />

// GA4, loaded by the snippet in each page's <head>. Absent when blocked.
interface Window {
  gtag?: (...args: unknown[]) => void;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
