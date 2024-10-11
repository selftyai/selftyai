import { StateStorage } from '@/server/types/Storage'

interface OllamaEnablePayload {
  storage: StateStorage
}

const enableOllama = async ({ storage }: OllamaEnablePayload) => {
  await storage.setItem('ollamaEnabled', JSON.stringify(true))

  return {
    enabled: true
  }
}

export default enableOllama
