import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import createGroqService from '@/server/utils/groq/createGroqService'
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
    if (request.type === ServerEndpoints.groqVerifyConnection) {
      const { url } = request.payload
      const service = await createGroqService()

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
