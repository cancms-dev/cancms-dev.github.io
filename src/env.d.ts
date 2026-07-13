// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

// Fontsource packages ship CSS only (no type declarations); declare them so
// side-effect imports type-check under TypeScript 6 strict (ts2882).
declare module '@fontsource-variable/*';
declare module '@fontsource/*';

// I18N global for client-side translation
declare interface Window {
  __I18N: {
    lang: string;
    translations: Record<string, string>;
    t: (key: string) => string;
  };
}

// Extend Astro locals for server-side i18n
declare namespace Astro {
  interface Locals {
    __i18n: {
      lang: string;
      translations: Record<string, string>;
      t: (key: string, params?: Record<string, string | number>) => string;
    };
  }
}
 
