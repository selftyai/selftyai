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

const monitorModels = async () => {
  const integration = await getOrCreateIntegration()
  const service = OllamaService.getInstance()
  service.setBaseURL(integration.baseURL || 'http://localhost:11434')

  if (!integration.active) {
    return
  }

  try {
    const models = await service.getModels()
    const dbModels = await db.models.toArray()

    for (const dbModel of dbModels) {
      const model = models.find((m) => m.name === dbModel.name)

      if (model && dbModel.id && dbModel.isDeleted) {
        await db.models.update(dbModel.id, {
          isDeleted: false
        })
      }

      if (!model && dbModel.id) {
        await db.models.update(dbModel.id, {
          isDeleted: true
        })
      }
    }

    for (const model of models) {
      const dbModel = await db.models.get({ name: model.name })

      if (!dbModel) {
        await db.models.add({
          name: model.name,
          model: model.model,
          provider: model.provider,
          vision: model.hasVision,
          isDeleted: false
        })
      }
    }
  } catch (error: unknown) {
    console.warn('Error while monitoring models:', error instanceof Error ? error.message : error)
  }
}

export default monitorModels
