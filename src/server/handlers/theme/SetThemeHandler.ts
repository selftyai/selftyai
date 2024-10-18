import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

class SetThemeHandler extends AbstractHandler<MessageEvent<string>, Promise<boolean>> {
  public async handle(request: MessageEvent<string>): Promise<boolean> {
    if (request.type === ServerEndpoints.setTheme) {
      await db.settings.put({ key: SettingsKeys.theme, value: request.payload })

      return true
    }

    return super.handle(request)
  }
}

export default SetThemeHandler
