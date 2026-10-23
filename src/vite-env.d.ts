/// <reference types="vite/client" />

// GA4, loaded by the snippet in each page's <head>. Absent when blocked.
interface Window {
  gtag?: (...args: unknown[]) => void;
}
