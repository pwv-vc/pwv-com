/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MAILCHIMP_ACTION_URL?: string;
  readonly PUBLIC_MAILCHIMP_U?: string;
  readonly PUBLIC_MAILCHIMP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    socialSharingURL: string;
  }
}
