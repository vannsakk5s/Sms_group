import { inject } from "@angular/core";
import { I18NEXT_SERVICE } from "angular-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// i18n-initializer.ts (Refined for new projects)
export function i18nAppInit() {
  return async () => {
    const i18next = inject(I18NEXT_SERVICE) as any;
    return i18next // Return the promise
      .use(HttpApi)
      .use(LanguageDetector)
      .init({
        debug: true, // Useful for new projects to see loading errors
        supportedLngs: ['en', 'km'],
        fallbackLng: 'km',
        // lng: 'km', <--- Remove this to let LanguageDetector work
        backend: { loadPath: '/assets/locales/{{lng}}/{{ns}}.json' },
        detection: {
          order: ['localStorage', 'cookie', 'navigator'],
          caches: ['localStorage'],
        },
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: { escapeValue: false },
      });
  };
}