import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { supportedLanguages, getResources } from '@/shared/types/Languages'

i18n.use(initReactI18next).init({
  debug: process.env.NODE_ENV === 'development',
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: Object.keys(supportedLanguages),
  interpolation: {
    escapeValue: false
  },
  resources: getResources()
})

export default i18n
