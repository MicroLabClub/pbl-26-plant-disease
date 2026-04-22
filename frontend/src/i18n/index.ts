import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ro from './locales/ro.json';
import ru from './locales/ru.json';

const saved = localStorage.getItem('agricure-lang');
const browserLang = navigator.language.slice(0, 2);
const defaultLang = saved ?? (['ro', 'ru', 'en'].includes(browserLang) ? browserLang : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ro: { translation: ro }, ru: { translation: ru } },
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
