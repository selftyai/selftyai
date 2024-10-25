import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

class GetThemeHandler extends AbstractHandler<MessageEvent<unknown>, Promise<string>> {
  public async handle(request: MessageEvent<unknown>): Promise<string> {
    if (request.type === ServerEndpoints.getTheme) {
      const { value } = (await db.settings.get(SettingsKeys.theme)) || { value: 'dark' }

      return value
    }

    return super.handle(request)
  }
}

export default GetThemeHandler