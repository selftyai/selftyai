import en from '@/shared/translations/en.json'
import uk from '@/shared/translations/uk.json'

export const supportedLanguages = { en: 'en', uk: 'uk' } as const

export type Language = (typeof supportedLanguages)[keyof typeof supportedLanguages]

export const getResources = () => ({
  en: {
    translation: en
  },
  uk: {
    translation: uk
  }
})
