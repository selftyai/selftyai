import axios from 'axios'

import getOllamaService from '@/shared/getOllamaService'

interface DeleteModelPayload {
  modelTag: string
}

const deleteModel = async ({ modelTag }: DeleteModelPayload) => {
  const ollamaService = await getOllamaService()

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
