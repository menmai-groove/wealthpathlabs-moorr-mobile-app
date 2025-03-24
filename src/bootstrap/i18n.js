import i18nextReactNative from '@os-team/i18next-react-native-language-detector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from 'constant';
import i18next from 'i18next';
import Backend from 'i18next-chained-backend'; //Combine multiple of the existing backends for fallback and caching scenarios
import HttpApi from 'i18next-http-backend'; // fallback HttpApi load
import defaultLang from 'langs/en.json';
import { initReactI18next } from 'react-i18next';

const i18n = i18next.createInstance();
i18n.use(initReactI18next, i18nextReactNative, Backend).init({
  compatibilityJSON: 'v3',
  interpolation: { escapeValue: false }, // React already does escaping
  lng: AppConstants.defaultLanguage, // default language to use
  fallbackLng: AppConstants.defaultLanguage,
  debug: false,
  resources: {
    [AppConstants.defaultLanguage]: {
      [AppConstants.defaultLanguageNamespace]: defaultLang,
    },
  },
  backend: {
    backends: [
      AsyncStorage, // primary
      HttpApi, // fallback
    ],
    backendOptions: [
      {
        // prefix for stored languages
        // prefix: 'i18next_res_',

        // expiration
        // expirationTime: 7 * 24 * 60 * 60 * 1000,

        // language versions
        versions: {},
      },
      {
        // loadPath: '/locales/{{lng}}/{{ns}}.json', // HttpApi load path for my own fallback
      },
    ],
  },
});

export const runTimeTranslations = (
  runTimeData,
  lng,
  ns = AppConstants.defaultLanguageNamespace,
) => {
  i18n.services.resourceStore.addResourceBundle(lng, ns, runTimeData, true, true);
};

export default i18n;
