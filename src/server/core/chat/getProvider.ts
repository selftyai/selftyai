import { createOllama } from 'ollama-ai-provider'

import { OllamaService } from '@/server/services/OllamaService'

const providers = {
  ollama: () => {
    const ollamaService = OllamaService.getInstance()

    const ollama = createOllama({
      baseURL: `${ollamaService.getBaseURL()}/api`
    })

    return ollama
  }
} as const

const getProvider = (provider: string) => {
  const currentProvider = providers[provider as keyof typeof providers]

  if (!currentProvider) {
    throw new Error(`Provider ${provider} is not defined`)
  }

  return currentProvider()
}

export default getProvider
