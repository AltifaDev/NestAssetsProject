import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined or invalid, we can decide how to handle it.
  // For the [locale] dynamic segment, Next.js should provide the locale.
  // However, for some internal calls or root-level transitions, it might be undefined.

  const targetLocale = (locale && locales.includes(locale as any))
    ? locale
    : defaultLocale;

  return {
    locale: targetLocale,
    messages: (await import(`./messages/${targetLocale}.json`)).default
  };
});
