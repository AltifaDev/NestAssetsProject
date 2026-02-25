import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
    // All supported locales
    locales,

    // Used when no locale matches
    defaultLocale,

    // Optional: Locale prefix strategy: 'always' | 'as-needed' | 'never'
    localePrefix: 'as-needed',

    // Force English as default regardless of browser language
    localeDetection: false
});
