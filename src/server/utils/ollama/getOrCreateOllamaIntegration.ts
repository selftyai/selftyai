import { db } from '@/shared/db'
import { Integration } from '@/shared/db/models/Integration'
import { Integrations } from '@/shared/types/Integrations'

export default async function getOrCreateOllamaIntegration() {
  const integration = await db.integrations.get({ name: Integrations.ollama })

  if (!integration) {
    const integrationId = db.integrations.add({
      name: Integrations.ollama,
      active: false,
      baseURL: 'http://localhost:11434'
    })

    const integration = (await db.integrations.get(integrationId)) as Integration

    return integration
  }

  return integration
}
