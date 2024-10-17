import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import pullModel from '@/server/utils/ollama/pullModel'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface PullModelRequest {
  modelTag: string
}

interface PullModelResponse {
  success: boolean
  error?: string
  modelTag: string
}

class PullModelHandler extends AbstractHandler<
  ExtendedEvent<PullModelRequest>,
  Promise<PullModelResponse>
> {
  public async handle(request: ExtendedEvent<PullModelRequest>): Promise<PullModelResponse> {
    if (request.type === ServerEndpoints.ollamaPullModel) {
      const { modelTag } = request.payload

      return await pullModel(modelTag)
    }

    return super.handle(request)
  }
}

export default PullModelHandler
