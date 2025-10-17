/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly BUILD_TIMESTAMP?: string;
}

declare namespace App {
  interface Locals {
    socialSharingURL: string;
  }
}
