import en from '@/shared/translations/en.json'

export const supportedLanguages = { en: 'en' } as const

export type Language = (typeof supportedLanguages)[keyof typeof supportedLanguages]

export const getResources = () => ({
  en: {
    translation: en
  }
})
