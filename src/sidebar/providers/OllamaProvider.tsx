import React, { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { Model } from '@/shared/types/Model'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import type { ModelPullingStatus } from '@/shared/types/ollama/ModelPullingStatus'
import { useChromePort } from '@/sidebar/hooks/useChromePort'

const OllamaContext = React.createContext<
  | {
      models: Model[]
      pullingModels: ModelPullingStatus[]
      connected: boolean
      error: JSX.Element[] | string
      baseURL: string
      enabled: boolean
      deleteModel: (modelTag: string) => void
      pullModel: (modelTag: string) => void
      changeBaseURL: (url: string) => void
      enableOllama: () => void
      disableOllama: () => void
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

const OLLAMA_FETCH_INTERVAL = 5000 // 5 seconds

const OllamaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sendMessage, addMessageListener } = useChromePort()

  const [models, setModels] = React.useState<Model[]>([])
  const [connected, setConnected] = React.useState(false)
  const [pullingModels, setPullingModels] = React.useState<ModelPullingStatus[]>([])
  const [error, setError] = React.useState<JSX.Element[] | string>('')
  const [baseURL, setBaseURL] = React.useState('http://localhost:11434')
  const [enabled, setEnabled] = React.useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeListener = addMessageListener((message: any) => {
      const { type } = message

      console.log(`(OllamaProvider) Received message: ${type}`)

      const validationResponse = () => {
        setConnected(message.connected)
        setBaseURL(message.url)
        setEnabled(message.enabled)
        setError(message.error)

        // if (message.error) {
        //   if (message.error.includes('<LINK>')) {
        //     setError([
        //       <span>{message.error.substring(0, message.error.indexOf('<LINK>'))}</span>,
        //       <span className="relative">
        //         <a
        //           href="https://medium.com/dcoderai/how-to-handle-cors-settings-in-ollama-a-comprehensive-guide-ee2a5a1beef0"
        //           target="_blank"
        //           className="font-medium text-default-foreground hover:underline"
        //           rel="noreferrer"
        //         >
        //           {chrome.i18n.getMessage('setupOllamaOrigins')}
        //           {'.'}
        //         </a>
        //       </span>
        //     ])
        //   } else {
        //     setError([<p key="error">{message.error}</p>])
        //   }
        // }
      }

      const messageTypes = {
        [ServerEndpoints.ollamaModels]: () => {
          const isModelsChanged = models.length !== message.models.length

          if (isModelsChanged) {
            setModels(message.models)
          }

          validationResponse()
        },
        [ServerEndpoints.ollamaVerifyConnection]: validationResponse,
        [ServerEndpoints.ollamaChangeUrl]: validationResponse,
        [ServerEndpoints.ollamaDeleteModel]: () => {
          if (message.error) {
            toast.error(message.error, { position: 'top-center' })
            return
          }

          toast.success(`Model ${message.modelTag} deleted successfully`, {
            position: 'top-center'
          })
        },
        [ServerEndpoints.enableOllama]: () => {
          setEnabled(true)
          sendMessage(ServerEndpoints.ollamaModels)
        },
        [ServerEndpoints.disableOllama]: () => {
          setEnabled(true)
          sendMessage(ServerEndpoints.ollamaModels)
        },
        [ServerEndpoints.integrationStatusOllama]: () => {
          sendMessage(ServerEndpoints.ollamaModels)
          setEnabled(message.enabled)
        },
        modelPullStatus: () => {
          const updatedPullingModels = pullingModels.map((item) =>
            item.modelTag === message.status.modelTag ? message.status : item
          )
          if (!updatedPullingModels.find((item) => item.modelTag === message.status.modelTag)) {
            updatedPullingModels.push(message.status)
          }
          setPullingModels(updatedPullingModels)
        },
        modelPullStart: () => {
          setPullingModels([
            ...pullingModels,
            { status: 'pulling progress', modelTag: message.modelTag }
          ])
        },
        modelPullSuccess: () => {
          const updatedPullingModels = pullingModels.filter(
            (item) => item.modelTag !== message.modelTag
          )
          setPullingModels(updatedPullingModels)
          sendMessage(ServerEndpoints.ollamaModels)
          toast.success(`Model ${message.modelTag} has been pulled successfully`, {
            position: 'top-center'
          })
        }
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]
      if (messageType) messageType()
    })

    return () => removeListener()
  }, [
    addMessageListener,
    sendMessage,
    pullingModels,
    setModels,
    setPullingModels,
    setConnected,
    setBaseURL,
    baseURL,
    setError,
    models
  ])

  useEffect(() => {
    sendMessage(ServerEndpoints.integrationStatusOllama)
  }, [sendMessage])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const intervalId = setInterval(() => {
      sendMessage(ServerEndpoints.ollamaModels)
    }, OLLAMA_FETCH_INTERVAL)

    return () => clearInterval(intervalId)
  }, [sendMessage, enabled])

  const deleteModel = useCallback(
    (modelTag: string) => {
      sendMessage(ServerEndpoints.ollamaDeleteModel, { modelTag })
    },
    [sendMessage]
  )

  const pullModel = useCallback(
    (modelTag: string) => {
      if (pullingModels.find((item) => item.modelTag === modelTag)) {
        toast.error('Model is pulling', { position: 'top-center' })
        return
      }

      if (models.find((item) => item.model === modelTag)) {
        toast.error('Model already pulled', { position: 'top-center' })
        return
      }

      sendMessage(ServerEndpoints.ollamaPullModel, { modelTag })
    },
    [sendMessage, pullingModels, models]
  )

  const changeBaseURL = useCallback(
    (url: string) => {
      setBaseURL(url)
      sendMessage(ServerEndpoints.ollamaChangeUrl, { url })
    },
    [sendMessage, setBaseURL]
  )

  const enableOllama = useCallback(() => {
    sendMessage(ServerEndpoints.enableOllama)
  }, [sendMessage])

  const disableOllama = useCallback(() => {
    sendMessage(ServerEndpoints.disableOllama)
  }, [sendMessage])

  return (
    <OllamaContext.Provider
      value={{
        baseURL,
        deleteModel,
        pullModel,
        changeBaseURL,
        models,
        connected,
        pullingModels,
        error,
        enabled,
        enableOllama,
        disableOllama
      }}
    >
      {children}
    </OllamaContext.Provider>
  )
}

export default OllamaProvider
