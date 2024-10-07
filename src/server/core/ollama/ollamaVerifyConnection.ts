import getOllamaService from '@/server/core/ollama/getOllamaService'
import { StateStorage } from '@/server/types/Storage'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'

interface OllamaVerifyConnectionPayload {
  url?: string
  storage: StateStorage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcastMessage: (data: any) => void
}

const ollamaVerifyConnection = async ({ url, storage }: OllamaVerifyConnectionPayload) => {
  const ollamaService = await getOllamaService(storage)

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
