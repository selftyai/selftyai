/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useTheme } from '@/sidebar/providers/ThemeProvider'
import sendMessageAsync from '@/sidebar/utils/sendMessageAsync'

interface PageContentContextProps {
  isPageOverlayEnabled?: boolean
  isContextInPromptEnabled?: boolean
}

const PageContentContext = createContext<PageContentContextProps | undefined>(undefined)

export const PageContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { changeTheme } = useTheme()
  const { i18n } = useTranslation()

  const [isPageOverlayEnabled, setIsPageOverlayEnabled] = React.useState<boolean | undefined>()
  const [isContextInPromptEnabled, setIsContextInPromptEnabled] = React.useState<
    boolean | undefined
  >()

  console.log(isContextInPromptEnabled)

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (message: any) => {
      const { type, payload } = message

      const messageTypes = {
        [ContentScriptServerEndpoints.themeChanged]: () => changeTheme(payload, true),
        [ContentScriptServerEndpoints.languageChanged]: () => i18n.changeLanguage(payload),
        [ContentScriptServerEndpoints.setPageOverlayIsEnable]: () =>
          setIsPageOverlayEnabled(payload),
        [ContentScriptServerEndpoints.setIsContextInPromptEnabled]: () =>
          setIsContextInPromptEnabled(payload)
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

  React.useEffect(() => {
    sendMessageAsync<string>({
      type: ServerEndpoints.getSettings,
      payload: SettingsKeys.isPageOverlayEnable
    }).then((value: string) => {
      if (value === 'true' || value === 'default') setIsPageOverlayEnabled(true)
      if (value === 'false') setIsPageOverlayEnabled(false)
      console.log(`[PageContentProvider] Received PageOverlayIsEnable: ${value}`)
    })

    sendMessageAsync<string>({
      type: ServerEndpoints.getSettings,
      payload: SettingsKeys.isContextInPromptEnabled
    }).then((value: string) => {
      if (value === 'true' || value === 'default') setIsContextInPromptEnabled(true)
      if (value === 'false') setIsContextInPromptEnabled(false)
      console.log(`[PageContentProvider] Received isContextInPromptEnabled: ${value}`)
    })
  }, [])

  return (
    <PageContentContext.Provider value={{ isPageOverlayEnabled, isContextInPromptEnabled }}>
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
