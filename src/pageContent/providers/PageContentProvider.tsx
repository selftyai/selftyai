/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import { useTheme } from '@/sidebar/providers/ThemeProvider'

interface PageContentContextProps {
  isContextEnabled: boolean
}

const PageContentContext = createContext<PageContentContextProps | undefined>(undefined)

export const PageContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { changeTheme } = useTheme()
  const { i18n } = useTranslation()

  const [isContextEnabled, setIsContextEnabled] = React.useState(true)

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (message: any) => {
      const { type, payload } = message

      const messageTypes = {
        [ContentScriptServerEndpoints.themeChanged]: () => changeTheme(payload, true),
        [ContentScriptServerEndpoints.languageChanged]: () => i18n.changeLanguage(payload),
        [ContentScriptServerEndpoints.setContextIsEnable]: () => setIsContextEnabled(payload)
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]

      if (messageType) {
        console.log(`[PageContentProvider] Received message: ${type} with payload:`, payload)
        messageType()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [changeTheme, i18n])

  return (
    <PageContentContext.Provider value={{ isContextEnabled }}>
      {children}
    </PageContentContext.Provider>
  )
}

export const usePageContent = (): PageContentContextProps => {
  const context = useContext(PageContentContext)
  if (!context) {
    throw new Error('usePageContent must be used within a PageContentProvider')
  }
  return context
}
