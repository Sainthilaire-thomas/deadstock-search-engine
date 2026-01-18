/**
 * i18n Request Configuration
 * 
 * Configuration pour next-intl côté serveur.
 * Gère le chargement des messages selon la locale.
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isValidLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  // Essayer de récupérer la locale depuis le cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Déterminer la locale
  let locale: Locale = defaultLocale;
  
  if (localeCookie && isValidLocale(localeCookie)) {
    locale = localeCookie;
  } else {
    // Sinon, essayer depuis Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('Accept-Language');
    
    if (acceptLanguage) {
      const preferredLocales = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2));
      
      const matchedLocale = preferredLocales.find(l => isValidLocale(l));
      if (matchedLocale && isValidLocale(matchedLocale)) {
        locale = matchedLocale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
