import { OllamaService } from '@/server/services/OllamaService'
import { StateStorage } from '@/server/types/Storage'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'

const getOllamaService = async (storage: StateStorage, url?: string): Promise<OllamaService> => {
  const ollamaService = OllamaService.getInstance()

  const ollamaBaseURL = await storage.getItem(OllamaStorageKeys.baseURL)
  const urlToVerify = url || ollamaBaseURL || 'http://localhost:11434'

  ollamaService.setBaseURL(urlToVerify)

  return ollamaService
}

export default getOllamaService
