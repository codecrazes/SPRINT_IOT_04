import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import es from './locales/es.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: 'pt',
  resources: {
    pt: { translation: pt },
    es: { translation: es },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
