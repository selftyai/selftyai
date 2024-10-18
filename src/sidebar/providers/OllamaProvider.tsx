import { useLiveQuery } from 'dexie-react-hooks'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { db } from '@/shared/db'
import { Integration } from '@/shared/db/models/Integration'
import { Model } from '@/shared/db/models/Model'
import { OllamaPullModel } from '@/shared/db/models/OllamaPullModel'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'

const OllamaContext = React.createContext<
  | {
      models?: Model[]
      pullingModels?: OllamaPullModel[]
      integration?: Integration
      connected: boolean
      verifyingConnection: boolean
      toggleOllama: (active: boolean) => void
      verifyConnection: (url: string) => void
      changeBaseURL: (url: string) => void
      pullModel: (modelTag: string) => void
      deleteModel: (modelTag: string) => void
    }
  | undefined
>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useOllama = () => {
  const context = React.useContext(OllamaContext)
  if (!context) {
    throw new Error('useOllama must be used within a OllamaProvider')
  }
  return context
}

const OllamaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sendMessage, addMessageListener } = useChromePort()
  const { t } = useTranslation()

  const models = useLiveQuery(async () => {
    const integration = await db.integrations.get({ name: 'ollama' })
    if (!integration || !integration.active) return []

    return db.models
      .where({ provider: 'ollama' })
      .and((model) => !model.isDeleted)
      .toArray()
  }, [])
  const pullingModels = useLiveQuery(() => db.ollamaPullingModels.toArray(), [])
  const integration = useLiveQuery(() => db.integrations.get({ name: 'ollama' }), [])

  const [connected, setConnected] = React.useState(false)
  const [verifyingConnection, setVerifyingConnection] = React.useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeListener = addMessageListener((message: any) => {
      const { type, response, ...rest } = message

      const messageTypes = {
        [ServerEndpoints.ollamaVerifyConnection]: () => {
          if (!integration) return

          setVerifyingConnection(false)

          if (response.url !== integration?.baseURL && response.connected) {
            toast.success(t('settings.integrations.ollama.connected'), { position: 'top-center' })
            return
          }

          if (response.url !== integration?.baseURL && !response.connected) {
            const messageTypes = {
              'Network Error': t('settings.integrations.ollama.disconnected')
            }

            const messageError =
              messageTypes[response.error as keyof typeof messageTypes] ||
              (response.error as string)

            toast.error(messageError, { position: 'top-center' })
            return
          }

          setConnected(response.connected)
        },
        [ServerEndpoints.ollamaDeleteModel]: () => {
          if (response.error) {
            toast.error(response.error, { position: 'top-center' })
            return
          }

          toast.success(
            t('settings.integrations.ollama.modelDeleted', {
              name: response.modelTag
            }),
            {
              position: 'top-center'
            }
          )
        },
        [ServerEndpoints.ollamaPullModel]: () => {
          if (response.error) {
            toast.error(response.error, { position: 'top-center' })
            return
          }

          toast.success(
            t('settings.integrations.ollama.modelPulled', {
              name: response.modelTag
            }),
            {
              position: 'top-center'
            }
          )
        }
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]
      if (messageType) {
        console.log(`[OllamaProvider] Received message: ${type} with data`, rest)
        messageType()
      }
    })

    return () => removeListener()
  }, [addMessageListener, sendMessage, pullingModels, setConnected, models, t, integration])

  useEffect(() => {
    if (!integration || !integration.active) {
      return
    }

    sendMessage(ServerEndpoints.ollamaVerifyConnection, { url: integration?.baseURL })

    const interval = setInterval(() => {
      if (!integration || !integration.active) {
        return
      }

      sendMessage(ServerEndpoints.ollamaVerifyConnection, { url: integration?.baseURL })
    }, 1000 * 5)

    return () => clearInterval(interval)
  }, [sendMessage, integration])

  const deleteModel = useCallback(
    (modelTag: string) => {
      sendMessage(ServerEndpoints.ollamaDeleteModel, { modelTag })
    },
    [sendMessage]
  )

  const pullModel = useCallback(
    (modelTag: string) => {
      if (pullingModels?.find((item) => item.modelTag === modelTag)) {
        toast.error(
          t('settings.integrations.ollama.modelPulling', {
            name: modelTag
          }),
          { position: 'top-center' }
        )
        return
      }

      if (models?.find((item) => item.model === modelTag)) {
        toast.error(
          t('settings.integrations.ollama.modelAlreadyPulled', {
            name: modelTag
          }),
          { position: 'top-center' }
        )
        return
      }

      sendMessage(ServerEndpoints.ollamaPullModel, { modelTag })
    },
    [sendMessage, pullingModels, models, t]
  )

  const changeBaseURL = useCallback(
    (url: string) => {
      if (!integration || !integration.id) {
        return
      }

      db.integrations.update(integration?.id, { baseURL: url })
      toast.success(t('settings.integrations.ollama.baseURLChanged'), { position: 'top-center' })
    },
    [integration, t]
  )

  const toggleOllama = useCallback(
    (active: boolean) => {
      if (!integration || !integration.id) {
        return
      }

      db.integrations.update(integration?.id, { active })
    },
    [integration]
  )

  const verifyConnection = useCallback(
    (url: string) => {
      setVerifyingConnection(true)
      sendMessage(ServerEndpoints.ollamaVerifyConnection, { url })
    },
    [sendMessage]
  )

  return (
    <OllamaContext.Provider
      value={{
        integration,
        models,
        pullingModels,
        connected,
        verifyingConnection,
        toggleOllama,
        verifyConnection,
        changeBaseURL,
        pullModel,
        deleteModel
      }}
    >
      {children}
    </OllamaContext.Provider>
  )
}

export default OllamaProvider
