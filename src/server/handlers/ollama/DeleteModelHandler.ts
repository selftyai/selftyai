import axios from 'axios'

import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import createOllamaService from '@/server/utils/ollama/createOllamaService'
import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface DeleteModelRequest {
  modelTag: string
}

interface DeleteModelResponse {
  success: boolean
  error?: string
  modelTag: string
}

class DeleteModelHandler extends AbstractHandler<
  ExtendedEvent<DeleteModelRequest>,
  Promise<DeleteModelResponse>
> {
  public async handle(request: ExtendedEvent<DeleteModelRequest>): Promise<DeleteModelResponse> {
    if (request.type === ServerEndpoints.ollamaDeleteModel) {
      const { modelTag } = request.payload
      const service = await createOllamaService()

      try {
        const success = await service.deleteModel(modelTag)

        const dbModel = await db.models.get({ model: modelTag, provider: Integrations.ollama })
        if (dbModel) {
          await db.models.update(dbModel, { isDeleted: true })
        }

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

    return super.handle(request)
  }
}

export default DeleteModelHandler
