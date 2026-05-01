import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
  type ConsentManagerOptions,
  type Theme,
} from '@c15t/react';

import type { ReactNode } from 'react';

/**
 * Create configuration options for React components to use
 *
 * These options configure access to the c15t consent management system
 * and exposes hooks and utilities for consent management.
 *
 * Styling follows the c15t customization ladder (see node_modules/@c15t/react/docs/styling/overview.md):
 * tokens and consentActions first, then slots for layout and brand accents Tailwind tokens cannot express.
 */

const isDev = import.meta.env.DEV;

const pwvConsentTheme = {
  colors: {
    primary: '#00d22e',
    primaryHover: '#00b827',
    surface: '#ffffff',
    // Light hover for rows, buttons, etc. Do not use black here — it is also applied to
    // privacy dialog accordion items and makes labels unreadable on hover.
    surfaceHover: '#e8e8e8',
    border: '#e4e4e4',
    borderHover: '#00d2c8',
    text: '#000000',
    textMuted: '#737373',
    textOnPrimary: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    switchTrack: '#e4e4e4',
    switchTrackActive: '#00d22e',
    switchThumb: '#ffffff',
  },
  typography: {
    fontFamily:
      "'DM Mono', ui-monospace, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
  },
  consentActions: {
    default: { variant: 'neutral', mode: 'stroke' },
    accept: { variant: 'primary', mode: 'stroke' },
    reject: { variant: 'neutral', mode: 'stroke' },
    customize: { variant: 'neutral', mode: 'stroke' },
  },
  slots: {
    consentBannerCard: 'border border-pwv-black shadow-lg',
    consentBannerTitle:
      'text-lg decoration-pwv-green underline decoration-3 underline-offset-8',
    consentBannerDescription: 'font-sans mt-4 leading-relaxed text-pwv-black/60',
    // Banner bar stays black; row hovers use theme.colors.surfaceHover (light) elsewhere.
    consentBannerFooter: [
      '!bg-pwv-black border-t border-white/10',
      // Reject
      `[&_[data-testid='consent-banner-reject-button']]:!bg-pwv-white`,
      `[&_[data-testid='consent-banner-reject-button']]:!text-pwv-black`,
      `[&_[data-testid='consent-banner-reject-button']]:!border`,
      `[&_[data-testid='consent-banner-reject-button']]:!border-pwv-gray`,
      `[&_[data-testid='consent-banner-reject-button']]:!shadow-none`,
      `[&_[data-testid='consent-banner-reject-button']]:hover:!border-pwv-soft-coral`,
      `[&_[data-testid='consent-banner-reject-button']]:hover:!bg-pwv-soft-coral`,
      `[&_[data-testid='consent-banner-reject-button']]:hover:!text-pwv-black`,
      `[&_[data-testid='consent-banner-reject-button']]:focus-visible:!ring-2`,
      `[&_[data-testid='consent-banner-reject-button']]:focus-visible:!ring-pwv-green`,
      `[&_[data-testid='consent-banner-reject-button']]:focus-visible:!ring-offset-2`,
      `[&_[data-testid='consent-banner-reject-button']]:focus-visible:!ring-offset-black`,
      // Accept — black type + green border reads better than light green on white
      `[&_[data-testid='consent-banner-accept-button']]:!bg-pwv-white`,
      `[&_[data-testid='consent-banner-accept-button']]:!text-pwv-black`,
      `[&_[data-testid='consent-banner-accept-button']]:!border-2`,
      `[&_[data-testid='consent-banner-accept-button']]:!border-pwv-green`,
      `[&_[data-testid='consent-banner-accept-button']]:!shadow-none`,
      `[&_[data-testid='consent-banner-accept-button']]:hover:!bg-pwv-light-green`,
      `[&_[data-testid='consent-banner-accept-button']]:hover:!text-pwv-black`,
      `[&_[data-testid='consent-banner-accept-button']]:hover:!border-pwv-green`,
      `[&_[data-testid='consent-banner-accept-button']]:focus-visible:!ring-2`,
      `[&_[data-testid='consent-banner-accept-button']]:focus-visible:!ring-pwv-green`,
      `[&_[data-testid='consent-banner-accept-button']]:focus-visible:!ring-offset-2`,
      `[&_[data-testid='consent-banner-accept-button']]:focus-visible:!ring-offset-black`,
      // Customize
      `[&_[data-testid='consent-banner-customize-button']]:!bg-pwv-white`,
      `[&_[data-testid='consent-banner-customize-button']]:!text-pwv-black`,
      `[&_[data-testid='consent-banner-customize-button']]:!border`,
      `[&_[data-testid='consent-banner-customize-button']]:!border-pwv-gray`,
      `[&_[data-testid='consent-banner-customize-button']]:!shadow-none`,
      `[&_[data-testid='consent-banner-customize-button']]:hover:!bg-pwv-light-teal`,
      `[&_[data-testid='consent-banner-customize-button']]:hover:!text-pwv-black`,
      `[&_[data-testid='consent-banner-customize-button']]:hover:!border-pwv-teal`,
      `[&_[data-testid='consent-banner-customize-button']]:focus-visible:!ring-2`,
      `[&_[data-testid='consent-banner-customize-button']]:focus-visible:!ring-pwv-green`,
      `[&_[data-testid='consent-banner-customize-button']]:focus-visible:!ring-offset-2`,
      `[&_[data-testid='consent-banner-customize-button']]:focus-visible:!ring-offset-black`,
    ].join(' '),

    consentDialogTitle:
      'text-lg decoration-pwv-green underline decoration-3 underline-offset-8',
    consentDialogDescription: 'font-sans mt-4 leading-relaxed text-pwv-black/60',

    consentWidgetAccordion: 'font-sans leading-relaxed text-pwv-black/60',
    consentWidgetFooter: [
      'gap-3 border-t border-pwv-gray pt-6',
      // Match banner footer: Reject All uses coral hover in the privacy dialog widget row
      `[&_[data-testid='consent-widget-reject-button']]:hover:!border-pwv-soft-coral`,
      `[&_[data-testid='consent-widget-reject-button']]:hover:!bg-pwv-soft-coral`,
      `[&_[data-testid='consent-widget-reject-button']]:hover:!text-pwv-black`,
    ].join(' '),

    buttonPrimary:
      'shadow-none focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-pwv-green focus-visible:ring-offset-0',
    buttonSecondary:
      'shadow-none focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-pwv-green focus-visible:ring-offset-0',
    toggle:
      'focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-pwv-green focus-visible:ring-offset-0',
  },
} satisfies Theme;

const c15tOptions: ConsentManagerOptions = {
  ...(isDev
    ? { mode: 'offline' as const }
    : {
        mode: 'hosted' as const,
        backendURL: import.meta.env.PUBLIC_C15T_BACKEND_URL || '',
      }),
  consentCategories: ['necessary', 'marketing'],
  theme: pwvConsentTheme,
};

export const ConsentManagerLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ConsentManagerProvider options={c15tOptions}>
      {children}
      <ConsentBanner layout={[['reject', 'accept'], 'customize']} primaryButton="accept" />
      <ConsentDialog />
    </ConsentManagerProvider>
  );
};
