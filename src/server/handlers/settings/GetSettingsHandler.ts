import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface GetSettingsResponse {
  value: string
  error?: string
}

class GetSettingsHandler extends AbstractHandler<
  MessageEvent<SettingsKeys>,
  Promise<GetSettingsResponse>
> {
  public async handle(request: MessageEvent<SettingsKeys>): Promise<GetSettingsResponse> {
    if (request.type === ServerEndpoints.getSettings) {
      try {
        const { value } = (await db.settings.get(request.payload)) || { value: 'default' }
        return { value }
      } catch (error) {
        return {
          value: 'default',
          error: error instanceof Error ? error.message : 'Unexpected error while fetching settings'
        }
      }
    }

    return super.handle(request)
  }
}

export default GetSettingsHandler
