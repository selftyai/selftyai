// import { createOllama } from 'ollama-ai-provider'
import { ChatOllama } from '@langchain/ollama'

import createOllamaService from '@/server/utils/ollama/createOllamaService'

const providers = {
  ollama: async (model: string) => {
    const service = await createOllamaService()

    return new ChatOllama({
      model,
      baseUrl: service.getBaseURL()
    })
  }
} as const

const getProvider = async (provider: string, model: string) => {
  const currentProvider = providers[provider as keyof typeof providers]

  if (!currentProvider) {
    throw new Error(`Provider ${provider} is not defined`)
  }

  return currentProvider(model)
}

export default getProvider
