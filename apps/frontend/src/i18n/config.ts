export const locales = ['en', 'th', 'zh', 'de', 'fr', 'es', 'ja', 'ko', 'pt', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
