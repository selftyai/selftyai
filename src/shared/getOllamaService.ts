import { OllamaService } from '@/server/services/OllamaService'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'
import { createChromeStorage } from '@/utils/storage'

const getOllamaService = async (url?: string): Promise<OllamaService> => {
  const ollamaService = OllamaService.getInstance()

  const storage = createChromeStorage('local')

  const ollamaBaseURL = await storage.getItem(OllamaStorageKeys.baseURL)
  const urlToVerify = url || ollamaBaseURL || 'http://localhost:11434'

	ollamaService.setBaseURL(urlToVerify)

  return ollamaService
}

export default getOllamaService
