import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ja from './locales/ja/common.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: { common: ja }
    },
    lng: 'ja',
    fallbackLng: 'ja',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    keySeparator: false
  })

export default i18n