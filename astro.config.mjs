// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: netlify(),
  site:
    import.meta.env.URL ||
    import.meta.env.DEPLOY_URL ||
    'http://localhost:4321',
  vite: {
    plugins: [tailwindcss()],
  },
});
