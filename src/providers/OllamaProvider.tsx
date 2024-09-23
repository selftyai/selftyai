import React, { useMemo } from 'react'

import { Model } from '@/services/types/Model'
import { Provider } from '@/services/types/Provider'

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
  const [models, setModels] = React.useState<Model[]>([])
  const [connected, setConnected] = React.useState<boolean>(false)
  const [error, setError] = React.useState<JSX.Element[]>([])

  const modelsPort = useMemo(() => {
    const chromePort = chrome.runtime.connect({ name: 'ollama' })

    chromePort.onMessage.addListener((message) => {
      const types = {
        getModels: () => {
          setModels(message.models.filter((model: Model) => model.provider === Provider.OLLAMA))
        },
        connected: () => {
          setConnected(message.connected)
          setError([])

          if (message.error.includes('<LINK>')) {
            setError([
              <span>{message.error.substring(0, message.error.indexOf('<LINK>'))}</span>,
              <span className="relative">
                <a
                  href="https://medium.com/dcoderai/how-to-handle-cors-settings-in-ollama-a-comprehensive-guide-ee2a5a1beef0"
                  target="_blank"
                  className="font-medium text-default-foreground hover:underline"
                >
                  {chrome.i18n.getMessage('setupOllamaOrigins')}
                  {'.'}
                </a>
              </span>
            ])
            return
          }

          if (message.error === 'Failed to fetch') {
            setError([<p key="fetch-error">{chrome.i18n.getMessage('ollamaConnectionError')}</p>])
            return
          }

          if (message.error) {
            setError([<p key="error">{message.error}</p>])
          }
        }
      }

      const type = types[message.type as keyof typeof types]

      if (type) {
        type()
      }
    })

    return chromePort
  }, [])

  React.useEffect(() => {
    modelsPort.postMessage({ type: 'getModels' })
    modelsPort.postMessage({ type: 'connected' })

    setInterval(() => {
      modelsPort.postMessage({ type: 'connected' })
      modelsPort.postMessage({ type: 'getModels' })
    }, 5000)

    return () => {
      modelsPort.disconnect()
    }
  }, [modelsPort])

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
