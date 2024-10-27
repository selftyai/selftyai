import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

class GetSettingsHandler extends AbstractHandler<MessageEvent<SettingsKeys>, Promise<string>> {
  public async handle(request: MessageEvent<SettingsKeys>): Promise<string> {
    if (request.type === ServerEndpoints.getSettings) {
      const { value } = (await db.settings.get(request.payload)) || { value: 'default' }

      return value
    }

    return super.handle(request)
  }
}

export default GetSettingsHandler
