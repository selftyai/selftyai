import getOllamaService from '@/server/core/ollama/getOllamaService'
import { db } from '@/shared/db'

const ollamaModels = async () => {
  const service = await getOllamaService()

  const integration = await db.integrations.get({ name: 'ollama' })

  if (!integration || !integration?.active) {
    return {
      models: [],
      connected: false,
      url: integration?.baseURL,
      error: '',
      enabled: false
    }
  }

  try {
    const models = await service.getModels()

    return {
      models,
      connected: true,
      error: '',
      url: integration.baseURL,
      enabled: integration.active
    }
  } catch (error: unknown) {
    return {
      models: [],
      connected: false,
      url: integration.baseURL,
      error: error instanceof Error ? error.message : String(error),
      enabled: integration.active
    }
  }
}

export default ollamaModels
