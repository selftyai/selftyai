import React from 'react'
import { useTranslation } from 'react-i18next'

import { Language } from '@/shared/types/Languages'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import sendMessageAsync from '@/sidebar/utils/sendMessageAsync'

export const LanguageContext = React.createContext<
  | {
      changeLanguage: (language: Language) => void
    }
  | undefined
>(undefined)

const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { i18n } = useTranslation()

  const [isSynchronized, setIsSynchronized] = React.useState<boolean>(false)

  const changeLanguage = React.useCallback(
    async (language: Language) => {
      await sendMessageAsync({ type: ServerEndpoints.changeLanguage, payload: language })
      i18n.changeLanguage(language)
    },
    [i18n]
  )

  React.useEffect(() => {
    sendMessageAsync({ type: ServerEndpoints.getCurrentLanguage }).then((language: unknown) => {
      if (typeof language !== 'string') {
        return
      }

      i18n.changeLanguage(language)
      setIsSynchronized(true)
    })
  }, [i18n])

  if (!isSynchronized) {
    return null
  }

  return <LanguageContext.Provider value={{ changeLanguage }}>{children}</LanguageContext.Provider>
}

export default LanguageProvider
