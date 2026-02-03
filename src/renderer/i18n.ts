import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "B3hPicTool Initializing...",
        },
      },
      fa: {
        translation: {
          welcome: "در حال راه‌اندازی ابزار تصویر بهرنگ...",
        },
      },
    },
    lng: 'fa', // Default to Persian as requested (implied by user language)
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
