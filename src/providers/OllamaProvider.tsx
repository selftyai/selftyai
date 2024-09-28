import React from 'react'

import { useOllamaStore } from '@/stores/ollamaStore'
import { AIProvider } from '@/types/AIProvider'
import type { Model } from '@/types/Model'

interface OllamaContextType {
  models: Model[]
  connected: boolean
  error: JSX.Element[]
}

const OllamaContext = React.createContext<OllamaContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useOllama = () => {
  const context = React.useContext(OllamaContext)

  if (!context) {
    throw new Error('useOllama must be used within a OllamaContext')
  }

  return context
}

interface OllamaProviderProps {
  children: React.ReactNode
}

const OllamaProvider = ({ children }: OllamaProviderProps) => {
  const { models, setModels, connected, setConnected } = useOllamaStore()

  const [error, setError] = React.useState<JSX.Element[]>([])

  React.useEffect(() => {
    const port = chrome.runtime.connect()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (message: any) => {
      const { type } = message

      const messageTypes = {
        getModels: () =>
          setModels(message.models.filter((model: Model) => model.provider === AIProvider.ollama)),
        connected: () => {
          setConnected(message.connected)
          setError([])

          if (message.error) {
            if (message.error.includes('<LINK>')) {
              setError([
                <span>{message.error.substring(0, message.error.indexOf('<LINK>'))}</span>,
                <span className="relative">
                  <a
                    href="https://medium.com/dcoderai/how-to-handle-cors-settings-in-ollama-a-comprehensive-guide-ee2a5a1beef0"
                    target="_blank"
                    className="font-medium text-default-foreground hover:underline"
                    rel="noreferrer"
                  >
                    {chrome.i18n.getMessage('setupOllamaOrigins')}
                    {'.'}
                  </a>
                </span>
              ])
            } else {
              setError([<p key="error">{message.error}</p>])
            }
          }
        }
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]

      if (!messageType) {
        return
      }

      messageType()
    }

    port.onMessage.addListener(handleMessage)

    port.postMessage({ type: 'getModels' })
    port.postMessage({ type: 'connected' })

    const intervalId = setInterval(() => {
      port.postMessage({ type: 'connected' })
      port.postMessage({ type: 'getModels' })
    }, 5000)

    return () => {
      clearInterval(intervalId)
      port.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <OllamaContext.Provider
      value={{
        models,
        connected,
        error
      }}
    >
      {children}
    </OllamaContext.Provider>
  )
}

export default OllamaProvider
