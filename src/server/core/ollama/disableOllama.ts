import { StateStorage } from '@/server/types/Storage'

interface OllamaEnablePayload {
  storage: StateStorage
}

const disableOllama = async ({ storage }: OllamaEnablePayload) => {
  await storage.setItem('ollamaEnabled', JSON.stringify(false))

  return {
    enabled: false
  }
}

export default disableOllama
