/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useTheme } from '@/sidebar/providers/ThemeProvider'
import sendMessageAsync from '@/sidebar/utils/sendMessageAsync'

interface PageContentContextProps {
  isPageOverlayEnabled: boolean
  isContextInPromptEnabled: boolean
}

const PageContentContext = createContext<PageContentContextProps | undefined>(undefined)

export const PageContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { changeTheme } = useTheme()
  const { i18n } = useTranslation()

  const [isPageOverlayEnabled, setIsPageOverlayEnabled] = React.useState<boolean>(true)
  const [isContextInPromptEnabled, setIsContextInPromptEnabled] = React.useState<boolean>(true)

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
        if (process.env.NODE_ENV === 'development') {
          console.log(`[PageContentProvider] Received message: ${type} with payload:`, payload)
        }
        messageType()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [changeTheme, i18n])

  React.useEffect(() => {
    const fetchSettings = async (
      key: SettingsKeys,
      setter: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      const response = await sendMessageAsync<{ value: string; error?: string }>({
        type: ServerEndpoints.getSettings,
        payload: key
      })

      if (response.error) {
        throw new Error(`Error fetching ${key}: ${response.error}`)
      }

      setter(response.value === 'true' || response.value === 'default')
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PageContentProvider] Received ${key}: ${response.value}`)
      }
    }

    fetchSettings(SettingsKeys.isPageOverlayEnabled, setIsPageOverlayEnabled)
    fetchSettings(SettingsKeys.isContextInPromptEnabled, setIsContextInPromptEnabled)
  }, [])

  return (
    <PageContentContext.Provider value={{ isPageOverlayEnabled, isContextInPromptEnabled }}>
      {children}
    </PageContentContext.Provider>
  )
}

/**
 * Custom hook to access the PageContentContext.
 *
 * @returns {PageContentContextProps} The context value of PageContentContext.
 * @throws Will throw an error if the hook is used outside of a PageContentProvider.
 */
export const usePageContent = (): PageContentContextProps => {
  const context = useContext(PageContentContext)
  if (!context) {
    throw new Error('usePageContent must be used within a PageContentProvider')
  }
  return context
}
