'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function handleChange(newLocale: Locale) {
    startTransition(() => {
      // Mettre à jour le cookie
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
      // Recharger pour appliquer la nouvelle locale
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          disabled={isPending || loc === locale}
          className={`
            px-2 py-1 text-sm rounded-md transition-colors
            ${loc === locale 
              ? 'bg-primary text-primary-foreground font-medium' 
              : 'hover:bg-muted text-muted-foreground'
            }
            ${isPending ? 'opacity-50 cursor-wait' : ''}
          `}
          title={localeNames[loc]}
        >
          {localeFlags[loc]}
        </button>
      ))}
    </div>
  );
}
