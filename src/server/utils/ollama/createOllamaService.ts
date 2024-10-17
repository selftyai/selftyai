import { OllamaService } from '@/server/services/OllamaService'
import getOrCreateOllamaIntegration from '@/server/utils/ollama/getOrCreateOllamaIntegration'

export default async function createOllamaService(url?: string) {
  const service = OllamaService.getInstance()
  const integration = await getOrCreateOllamaIntegration()
  service.setBaseURL(url || integration.baseURL)

  return service
}
