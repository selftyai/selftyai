import { StateStorage } from '@/server/types/Storage'

interface OllamaStatusPayload {
  storage: StateStorage
}

const integrationStatusOllama = async ({ storage }: OllamaStatusPayload) => {
  const enabled = JSON.parse((await storage.getItem('ollamaEnabled')) || 'false') as boolean

  return {
    enabled
  }
}

export default integrationStatusOllama
