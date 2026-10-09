import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// The marketing site lives at "/" and the lesson-builder app at "/app/".
// The app references some public assets with paths relative to its page
// (e.g. "./covers/mat.svg" — also persisted inside saved lessons), so those
// folders must resolve under /app/ too: rewritten in dev, copied in build.
const APP_SHARED_PUBLIC_DIRS = ['covers', 'brand'];

function appSharedPublicAssets(): Plugin {
  const pattern = new RegExp(`^/app/(${APP_SHARED_PUBLIC_DIRS.join('|')})/`);
  return {
    name: 'app-shared-public-assets',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) req.url = req.url.replace(pattern, '/$1/');
        next();
      });
    },
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist');
      for (const dir of APP_SHARED_PUBLIC_DIRS) {
        const from = path.join(dist, dir);
        if (fs.existsSync(from)) fs.cpSync(from, path.join(dist, 'app', dir), {recursive: true});
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), appSharedPublicAssets()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          site: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'app/index.html'),
        },
        output: {
          // Function form so each vendor lands in exactly one chunk; the
          // object form let motion's chunk absorb shared code, which made the
          // marketing site preload an animation library it never uses.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor';
            if (/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
            if (id.includes('node_modules/lucide-react/')) return 'icons';
            if (id.includes('node_modules/@supabase/')) return 'supabase';
            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify; file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
