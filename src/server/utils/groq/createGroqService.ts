import { GroqService } from '@/server/services/GroqService'
import getOrCreateOllamaIntegration from '@/server/utils/groq/getOrCreateGroqIntegration'

/**
 * Create a Groq service
 * @param url The API key
 */
export default async function createGroqService(url?: string) {
  const service = GroqService.getInstance()
  const integration = await getOrCreateOllamaIntegration()
  service.setBaseURL(url || integration?.apiKey || '')

  return service
}
