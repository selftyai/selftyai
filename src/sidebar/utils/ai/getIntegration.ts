import { db } from '@/shared/db'
import { Integration } from '@/shared/db/models/Integration'
import { Integrations } from '@/shared/types/Integrations'

export default async function getIntegration(name: Integrations) {
  let integration = await db.integrations.get({ name })
  const models = await db.models.where({ provider: name }).toArray()

  if (!integration) {
    const integrationId = await db.integrations.put({
      name,
      apiKey: '',
      active: false,
      baseURL: ''
    })
    integration = await db.integrations.get(integrationId)
  }

  return { integration: integration as Integration, models }
}
