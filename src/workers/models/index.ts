import { getOllamaModels } from '@/workers/models/ollama'

export const getModels = async () => {
  const models = await getOllamaModels()

  return {
    models
  }
}
