import React from 'react'
import { useTranslation } from 'react-i18next'

import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { Language } from '@/shared/types/Languages'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import sendMessageAsync from '@/sidebar/utils/sendMessageAsync'

export const LanguageContext = React.createContext<
  | {
      changeLanguage: (language: Language) => void
    }
  | undefined
>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = React.useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { i18n } = useTranslation()

  const [isSynchronized, setIsSynchronized] = React.useState<boolean>(false)

  const changeLanguage = React.useCallback(
    async (language: Language) => {
      await db.settings.put({ key: SettingsKeys.language, value: language })
      i18n.changeLanguage(language)
    },
    [i18n]
  )

  React.useEffect(() => {
    sendMessageAsync<string>({ type: ServerEndpoints.getCurrentLanguage, payload: null }).then(
      (language) => {
        i18n.changeLanguage(language)
        setIsSynchronized(true)
      }
    )
  }, [i18n])

  if (!isSynchronized) {
    return null
  }

  return <LanguageContext.Provider value={{ changeLanguage }}>{children}</LanguageContext.Provider>
}

export default LanguageProvider
