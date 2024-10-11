import type { StateStorage } from '@/server/types/Storage'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'

interface OllamaEnablePayload {
  storage: StateStorage
}

const disableOllama = async ({ storage }: OllamaEnablePayload) => {
  await storage.setItem(OllamaStorageKeys.ollamaEnabled, 'false')

  return {
    enabled: false
  }
}

export default disableOllama
