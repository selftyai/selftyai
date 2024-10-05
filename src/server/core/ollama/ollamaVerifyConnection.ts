import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'
import getOllamaService from '@/shared/getOllamaService'
import { createChromeStorage } from '@/utils/storage'

interface OllamaVerifyConnectionPayload {
  url?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcastMessage: (data: any) => void
}

const ollamaVerifyConnection = async ({ url }: OllamaVerifyConnectionPayload) => {
  const ollamaService = await getOllamaService()
  const storage = createChromeStorage('local')

  const storedURL = (await storage.getItem(OllamaStorageKeys.baseURL)) || 'http://localhost:11434'

  try {
    const connected = await ollamaService.verifyConnection(url ?? storedURL)

    return {
      connected,
      url: storedURL ?? ollamaService.getBaseURL()
    }
  } catch (error: unknown) {
    return {
      connected: false,
      url: storedURL ?? ollamaService.getBaseURL(),
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export default ollamaVerifyConnection
