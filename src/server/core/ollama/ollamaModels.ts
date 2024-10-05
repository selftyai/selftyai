import getOllamaService from '@/shared/getOllamaService'

const ollamaModels = async () => {
  const ollamaService = await getOllamaService()

  try {
    const models = await ollamaService.getModels()

    return {
      models
    }
  } catch (error: unknown) {
    return {
      models: [],
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export default ollamaModels
