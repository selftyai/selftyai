import { createOllama } from 'ollama-ai-provider'

import { OllamaService } from '@/server/services/OllamaService'
import { AIProvider } from '@/types/AIProvider'

const getProvider = (provider: AIProvider) => {
  switch (provider) {
    case AIProvider.ollama: {
      const ollamaService = OllamaService.getInstance()

      const ollama = createOllama({
        baseURL: `${ollamaService.getBaseURL()}/api`
      })

      return ollama
    }
  }
}

export default getProvider
