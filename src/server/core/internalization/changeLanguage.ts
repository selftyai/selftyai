import type { StateStorage } from '@/server/types/Storage'
import { LanguageStorageKeys } from '@/server/types/internalization/LanguageStorageKeys'
import type { Language } from '@/shared/types/Languages'

interface ChangeLanguagePayload {
  payload: Language
  syncStorage: StateStorage
}

const changeLanguage = async ({ syncStorage, payload }: ChangeLanguagePayload) => {
  await syncStorage.setItem(LanguageStorageKeys.LANGUAGE, payload)

  return true
}

export default changeLanguage
