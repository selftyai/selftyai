import { createOllama } from 'ollama-ai-provider'

import { OllamaService } from '@/server/services/OllamaService'
import { AIProvider } from '@/shared/types/AIProvider'

const providers = {
  [AIProvider.ollama]: () => {
    const ollamaService = OllamaService.getInstance()

    const ollama = createOllama({
      baseURL: `${ollamaService.getBaseURL()}/api`
    })

    return ollama
  }
} as const

const getProvider = (provider: AIProvider) => {
  const currentProvider = providers[provider]

  if (!currentProvider) {
    throw new Error(`Provider ${provider} is not defined`)
  }

  return currentProvider()
}

export default getProvider
