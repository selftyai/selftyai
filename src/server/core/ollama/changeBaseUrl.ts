import ollamaVerifyConnection from '@/server/core/ollama/ollamaVerifyConnection'
import { StateStorage } from '@/server/types/Storage'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'

interface OllamaVerifyConnectionPayload {
  url: string
  storage: StateStorage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcastMessage: (data: any) => void
}

const changeBaseUrl = async ({ url, storage, broadcastMessage }: OllamaVerifyConnectionPayload) => {
  await storage.setItem(OllamaStorageKeys.baseURL, url)

  return await ollamaVerifyConnection({ url, storage, broadcastMessage })
}

export default changeBaseUrl
