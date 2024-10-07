import getOllamaService from '@/server/core/ollama/getOllamaService'
import { StateStorage } from '@/server/types/Storage'

interface OllamaModelsPayload {
  storage: StateStorage
}

const ollamaModels = async ({ storage }: OllamaModelsPayload) => {
  const ollamaService = await getOllamaService(storage)

  try {
    const models = await ollamaService.getModels()

    return {
      models
    }
  } catch (error: unknown) {
    return {
      models: [],
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export default ollamaModels
