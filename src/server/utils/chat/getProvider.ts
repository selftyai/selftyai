import { createOllama } from 'ollama-ai-provider'

import createOllamaService from '@/server/utils/ollama/createOllamaService'

const providers = {
  ollama: async () => {
    const service = await createOllamaService()

    const ollama = createOllama({
      baseURL: `${service.getBaseURL()}/api`
    })

    return ollama
  }
} as const

const getProvider = async (provider: string) => {
  const currentProvider = providers[provider as keyof typeof providers]

  if (!currentProvider) {
    throw new Error(`Provider ${provider} is not defined`)
  }

  return currentProvider()
}

export default getProvider
