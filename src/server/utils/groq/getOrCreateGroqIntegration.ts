import { db } from '@/shared/db'
import { Integration } from '@/shared/db/models/Integration'
import { Integrations } from '@/shared/types/Integrations'

export default async function getOrCreateGroqIntegration() {
  const integration = await db.integrations.get({ name: Integrations.groq })

  if (!integration) {
    const integrationId = await db.integrations.add({
      name: Integrations.groq,
      active: false,
      baseURL: '',
      apiKey: ''
    })

    const integration = (await db.integrations.get(integrationId)) as Integration

    return integration
  }

  return integration
}
