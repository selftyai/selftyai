import getOllamaService from '@/server/core/ollama/getOllamaService'
import type { StateStorage } from '@/server/types/Storage'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'

interface OllamaModelsPayload {
  storage: StateStorage
}

const ollamaModels = async ({ storage }: OllamaModelsPayload) => {
  const ollamaService = await getOllamaService(storage)
  const url = ollamaService.getBaseURL()

  const ollamaEnabled =
    ((await storage.getItem(OllamaStorageKeys.ollamaEnabled)) ?? 'false') === 'true'

  if (!ollamaEnabled) {
    return {
      models: [],
      connected: false,
      url,
      error: '',
      enabled: ollamaEnabled
    }
  }

  try {
    const models = await ollamaService.getModels()

    return {
      models,
      connected: true,
      error: '',
      url,
      enabled: ollamaEnabled
    }
  } catch (error: unknown) {
    return {
      models: [],
      connected: false,
      url,
      error: error instanceof Error ? error.message : String(error),
      enabled: ollamaEnabled
    }
  }
}

export default ollamaModels
