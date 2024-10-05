import ollamaVerifyConnection from '@/server/core/ollama/ollamaVerifyConnection'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'
import { createChromeStorage } from '@/utils/storage'

interface OllamaVerifyConnectionPayload {
  url: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcastMessage: (data: any) => void
}

const changeBaseUrl = async ({ url, broadcastMessage }: OllamaVerifyConnectionPayload) => {
  const storage = createChromeStorage('local')

  await storage.setItem(OllamaStorageKeys.baseURL, url)

  return await ollamaVerifyConnection({ url, broadcastMessage })
}

export default changeBaseUrl
