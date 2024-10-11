import axios from 'axios'

import getOllamaService from '@/server/core/ollama/getOllamaService'
import { StateStorage } from '@/server/types/Storage'

interface DeleteModelPayload {
  modelTag: string
  storage: StateStorage
}

const deleteModel = async ({ modelTag, storage }: DeleteModelPayload) => {
  const ollamaService = await getOllamaService(storage)

  try {
    const success = await ollamaService.deleteModel(modelTag)

    return {
      success,
      modelTag
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        modelTag,
        error: error.message
      }
    }

    return {
      success: false,
      modelTag,
      error: 'Unexpected error while deleting model'
    }
  }
}

export default deleteModel
