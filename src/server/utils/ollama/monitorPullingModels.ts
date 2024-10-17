import createOllamaService from '@/server/utils/ollama/createOllamaService'
import getOrCreateOllamaIntegration from '@/server/utils/ollama/getOrCreateOllamaIntegration'
import { db } from '@/shared/db'

export default async function monitorPullingModels() {
  const integration = await getOrCreateOllamaIntegration()

  if (!integration.active) return

  const service = await createOllamaService()

  try {
    const [models, dbModels] = await Promise.all([service.getModels(), db.models.toArray()])

    const modelMap = new Map(models.map((model) => [model.name, model]))

    const updates = dbModels
      .map((dbModel) => {
        const model = modelMap.get(dbModel.name)
        if (model && dbModel.id && dbModel.isDeleted) {
          return { id: dbModel.id, changes: { isDeleted: false } }
        }
        if (!model && dbModel.id) {
          return { id: dbModel.id, changes: { isDeleted: true } }
        }
        return null
      })
      .filter(Boolean)

    const newModels = models
      .filter((model) => !dbModels.some((dbModel) => dbModel.name === model.name))
      .map((model) => ({
        name: model.name,
        model: model.model,
        provider: model.provider,
        vision: model.vision,
        isDeleted: false
      }))

    await Promise.all([
      ...updates.map((update) => db.models.update(update!.id, update!.changes)),
      db.models.bulkAdd(newModels)
    ])
  } catch (error: unknown) {
    console.warn('Error while monitoring models:', error instanceof Error ? error.message : error)
  }
}
