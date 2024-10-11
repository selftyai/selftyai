import type { StateStorage } from '@/server/types/Storage'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'

interface OllamaEnablePayload {
  storage: StateStorage
}

const enableOllama = async ({ storage }: OllamaEnablePayload) => {
  await storage.setItem(OllamaStorageKeys.ollamaEnabled, 'true')

  return {
    enabled: true
  }
}

export default enableOllama
