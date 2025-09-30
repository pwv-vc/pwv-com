import {
  ConsentManagerDialog,
  type ConsentManagerOptions,
  ConsentManagerProvider,
  CookieBanner,
} from '@c15t/react';

import type { ReactNode } from 'react';

/**
 * Create configuration options for React components to use
 *
 * These options configure access to the c15t consent management system
 * and exposes hooks and utilities for consent management.
 */

const isDev = import.meta.env.DEV;

const c15tOptions: ConsentManagerOptions = {
  ...(isDev
    ? { mode: 'offline' as const }
    : {
        mode: 'c15t' as const,
        backendURL: import.meta.env.PUBLIC_C15T_BACKEND_URL || '',
      }),
  store: {
    initialGdprTypes: ['necessary', 'marketing'],
  },
};

console.log('c15tOptions', c15tOptions);

/**
 * PWV-branded theme for both CookieBanner and ConsentManagerDialog using DM Mono font and PWV colors
 */
const pwvConsentTheme = {
  // Banner styling
  'banner.root': 'font-serif',
  'banner.card': '!border !border-pwv-black !shadow-lg',
  'banner.header.title':
    '!text-lg decoration-pwv-green underline decoration-3 underline-offset-8',
  'banner.header.description':
    '!text-gray-500 !font-sans !mt-4 !leading-relaxed',
  'banner.footer': '!bg-pwv-black',
  'banner.footer.reject-button':
    '!bg-pwv-white !text-pwv-black !border !border-pwv-gray hover:!border-pwv-soft-coral focus:!border-pwv-gray focus:!outline-none focus:!ring-0 focus:!shadow-none !shadow-none hover:!bg-pwv-soft-coral',
  'banner.footer.accept-button':
    '!bg-pwv-white !text-pwv-green !border !border-pwv-green hover:!border-pwv-green focus:!border-pwv-green focus:!outline-none focus:!ring-0 focus:!shadow-none !shadow-none hover:!bg-pwv-light-green',
  'banner.footer.customize-button':
    '!bg-pwv-white !text-pwv-black !border !border-pwv-gray hover:!border-pwv-green focus:!border-pwv-teal focus:!outline-none focus:!ring-0 focus:!shadow-none !shadow-none hover:!bg-pwv-light-teal',

  // Dialog styling
  'dialog.root': 'font-serif',
  'dialog.title':
    '!text-lg decoration-pwv-green underline decoration-3 underline-offset-8',
  'dialog.description': '!text-gray-500 !font-sans !mt-4 !leading-relaxed',

  // Widget styling
  'widget.root': 'font-serif',
  'widget.header.title':
    '!text-lg decoration-pwv-green underline decoration-3 underline-offset-8',
  'widget.header.description':
    '!text-gray-500 !font-sans !mt-4 !leading-relaxed',
  'widget.accordion.content': '!text-gray-500 !font-sans !leading-relaxed',

  'widget.footer.reject-button':
    '!bg-pwv-white !text-pwv-black !border !border-pwv-soft-coral hover:!border-pwv-soft-coral focus:!border-pwv-soft-coral focus:!outline-none focus:!ring-0 focus:!shadow-none !shadow-none hover:!bg-pwv-light-coral',
  'widget.footer.accept-button':
    '!bg-pwv-white !text-pwv-green !border !border-pwv-green hover:!border-pwv-green focus:!border-pwv-green focus:!outline-none focus:!ring-0 focus:!shadow-none !shadow-none hover:!bg-pwv-light-green',
  'widget.footer.save-button':
    '!bg-pwv-white !text-pwv-black !border !border-pwv-teal hover:!border-pwv-soft-yeal focus:!border-pwv-soft-teal focus:!outline-none focus:!ring-0 focus:!shadow-none !shadow-none hover:!bg-pwv-light-teal',
  // Switch styling (Tailwind)
  // Root becomes a group so we can style track based on root's data-state
  'widget.switch':
    'group focus-visible:!ring-2 focus-visible:!ring-pwv-green focus-visible:!ring-offset-0',
  // When the root is checked, color the track PWV green
  'widget.switch.track': 'group-data-[state=checked]:!bg-pwv-green',
};

export const ConsentManagerLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ConsentManagerProvider options={c15tOptions}>
      {children}
      <CookieBanner theme={pwvConsentTheme} />
      <ConsentManagerDialog theme={pwvConsentTheme} />
    </ConsentManagerProvider>
  );
};
