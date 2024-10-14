import { StateStorage } from '@/server/types/Storage'
import { LanguageStorageKeys } from '@/server/types/internalization/LanguageStorageKeys'
import { supportedLanguages } from '@/shared/types/Languages'

interface getCurrentLanguageParams {
  syncStorage: StateStorage
}

const getCurrentLanguage = async ({ syncStorage }: getCurrentLanguageParams): Promise<string> => {
  const language =
    (await syncStorage.getItem(LanguageStorageKeys.LANGUAGE)) || supportedLanguages.en

  return language
}

export default getCurrentLanguage
