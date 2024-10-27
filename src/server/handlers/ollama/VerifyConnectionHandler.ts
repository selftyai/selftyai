import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import createOllamaService from '@/server/utils/ollama/createOllamaService'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface VerifyConnectionRequest {
  url?: string
}

interface VerifyConnectionResponse {
  connected: boolean
  url: string
  error?: string
}

class VerifyConnectionHandler extends AbstractHandler<
  ExtendedEvent<VerifyConnectionRequest>,
  Promise<VerifyConnectionResponse>
> {
  public async handle(
    request: ExtendedEvent<VerifyConnectionRequest>
  ): Promise<VerifyConnectionResponse> {
    if (request.type === ServerEndpoints.ollamaVerifyConnection) {
      const { url } = request.payload
      const service = await createOllamaService()

      const urlToVerify = url ?? service.getBaseURL()

      try {
        const connected = await service.verifyConnection(urlToVerify)

        return {
          connected,
          url: urlToVerify
        }
      } catch (error) {
        return {
          connected: false,
          url: urlToVerify,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }

    return super.handle(request)
  }
}

export default VerifyConnectionHandler
