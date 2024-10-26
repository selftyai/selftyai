import { useLiveQuery } from 'dexie-react-hooks'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { db } from '@/shared/db'
import { Integration } from '@/shared/db/models/Integration'
import { Model } from '@/shared/db/models/Model'
import { Integrations } from '@/shared/types/Integrations'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'

const GroqContext = React.createContext<
  | {
      models?: Model[]
      integration?: Integration
      connected: boolean
      verifyingConnection: boolean
      verifyConnection: (url: string) => void
    }
  | undefined
>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useGroq = () => {
  const context = React.useContext(GroqContext)
  if (!context) {
    throw new Error('useGroq must be used within a GroqProvider')
  }
  return context
}

const GroqProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sendMessage, addMessageListener } = useChromePort()
  const { t } = useTranslation()

  const models = useLiveQuery(async () => {
    const integration = await db.integrations.get({ name: Integrations.groq })
    if (!integration || !integration.active) return []

    return db.models.where({ provider: Integrations.groq }).toArray()
  }, [])

  const integration = useLiveQuery(() => db.integrations.get({ name: Integrations.groq }), [])

  const [connected, setConnected] = React.useState(false)
  const [verifyingConnection, setVerifyingConnection] = React.useState(false)

  const verifyConnectionListener = useCallback(
    (response: { connected: boolean; url: string; error?: string }) => {
      setVerifyingConnection(false)

      if (response.url !== integration?.apiKey && response.connected) {
        toast.success(t('settings.integrations.groq.connected'), { position: 'top-center' })
        return
      }

      if (response.url !== integration?.baseURL && !response.connected) {
        const messageTypes = {
          'Network Error': t('settings.integrations.groq.disconnected'),
          invalidApiKey: t('settings.integrations.groq.invalidApiKey')
        }

        const messageError =
          messageTypes[response.error as keyof typeof messageTypes] || (response.error as string)

        toast.error(messageError, { position: 'top-center' })
        return
      }

      setConnected(response.connected)
    },
    [integration, t]
  )

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeListener = addMessageListener((message: any) => {
      const { type, response } = message

      const messageTypes = {
        [ServerEndpoints.groqVerifyConnection]: verifyConnectionListener
      }

      messageTypes[type as keyof typeof messageTypes]?.(response)
    })

    return () => removeListener()
  }, [addMessageListener, verifyConnectionListener])

  useEffect(() => {
    if (!integration || !integration.active) {
      return
    }

    sendMessage(ServerEndpoints.groqVerifyConnection, { url: integration?.apiKey })
  }, [sendMessage, integration])

  const verifyConnection = useCallback(
    async (url: string) => {
      setVerifyingConnection(true)
      sendMessage(ServerEndpoints.groqVerifyConnection, { url })
    },
    [sendMessage]
  )

  return (
    <GroqContext.Provider
      value={{ models, integration, connected, verifyingConnection, verifyConnection }}
    >
      {children}
    </GroqContext.Provider>
  )
}

export default GroqProvider
