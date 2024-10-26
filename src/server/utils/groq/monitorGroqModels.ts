import createGroqService from '@/server/utils/groq/createGroqService'
import getOrCreateGroqIntegration from '@/server/utils/groq/getOrCreateGroqIntegration'
import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'

export default async function monitorGroqModels() {
  const integration = await getOrCreateGroqIntegration()

  if (!integration.active) return

  const groqModelsCount = await db.models.where({ provider: Integrations.groq }).count()

  if (!groqModelsCount) {
    const service = await createGroqService()
    const models = await service.getModels()

    await db.models.bulkAdd(models)
  }
}
