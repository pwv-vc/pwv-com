// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  site: process.env.URL || process.env.DEPLOY_URL || 'http://localhost:4321',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
