import { ChatGroq } from '@langchain/groq'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'

import createGithubService from '@/server/utils/github/createGithubService'
import createGroqService from '@/server/utils/groq/createGroqService'
import createOllamaService from '@/server/utils/ollama/createOllamaService'

const providers = {
  ollama: async (model: string) => {
    const service = await createOllamaService()

    return new ChatOllama({
      model,
      baseUrl: service.getBaseURL()
    })
  },
  groq: async (model: string) => {
    const service = await createGroqService()

    return new ChatGroq({
      model,
      apiKey: service.getBaseURL(),
      streaming: true
    })
  },
  githubModels: async (model: string) => {
    const service = await createGithubService()

    return new ChatOpenAI({
      model,
      apiKey: service.getBaseURL(),
      streaming: true,
      configuration: {
        baseURL: 'https://models.inference.ai.azure.com'
      }
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
