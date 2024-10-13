import { OllamaService } from '@/server/services/OllamaService'
import { db } from '@/shared/db'
import { Integration } from '@/shared/db/models/Integration'

const getOrCreateIntegration = async (): Promise<Integration> => {
  const integration = await db.integrations.get({ name: 'ollama' })

  if (!integration) {
    const integrationId = await db.integrations.add({
      name: 'ollama',
      active: false,
      baseURL: 'http://localhost:11434'
    })

    const integration = await db.integrations.get(integrationId)

    if (!integration) {
      throw new Error('Could not create Ollama integration')
    }

    return integration
  }

  return integration
}

const getOllamaService = async (url?: string): Promise<OllamaService> => {
  const ollamaService = OllamaService.getInstance()

  const integration = await getOrCreateIntegration()

  const urlToVerify = url || integration.baseURL

  ollamaService.setBaseURL(urlToVerify)

  return ollamaService
}

export default getOllamaService
