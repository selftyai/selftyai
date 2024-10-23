import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

class GetContextIsEnableHandler extends AbstractHandler<MessageEvent<unknown>, Promise<boolean>> {
  public async handle(request: MessageEvent<unknown>): Promise<boolean> {
    if (request.type === ServerEndpoints.getIsContextEnabled) {
      const { value } = (await db.settings.get(SettingsKeys.isContextEnable)) || { value: 'true' }

      return Boolean(value)
    }

    return super.handle(request)
  }
}

export default GetContextIsEnableHandler
