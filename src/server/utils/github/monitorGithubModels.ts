import createGithubService from '@/server/utils/github/createGithubService'
import getOrCreateGithubIntegration from '@/server/utils/github/getOrCreateGithubIntegration'
import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'

export default async function monitorGithubModels() {
  const integration = await getOrCreateGithubIntegration()

  if (!integration.active) return

  const githubModelsCount = await db.models.where({ provider: Integrations.githubModels }).count()

  if (!githubModelsCount) {
    const service = await createGithubService()
    const models = await service.getModels()

    await db.models.bulkAdd(models)
  }
}
