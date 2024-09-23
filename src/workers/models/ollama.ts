/* eslint-disable @typescript-eslint/no-explicit-any */
import OllamaService from '@/services/ollama/OllamaService'

export const getOllamaModels = async () => {
  try {
    const ollamaService = OllamaService.getInstance()

    const models = await ollamaService.getModels()

    return models
  } catch (error: any) {
    console.error(error.message)
    return []
  }
}

export const isConnected = async () => {
  try {
    const ollamaService = OllamaService.getInstance()

    const connected = await ollamaService.verifyConnection()

    return {
      connected
    }
  } catch (error: any) {
    console.error(error.message)
    return {
      connected: false,
      error: error.message
    }
  }
}
