import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import sendMessageToContentScript from '@/shared/utils/sendMessageToContentScript'

class SetThemeHandler extends AbstractHandler<MessageEvent<string>, Promise<boolean>> {
  public async handle(request: MessageEvent<string>): Promise<boolean> {
    if (request.type === ServerEndpoints.setTheme) {
      await db.settings.put({ key: SettingsKeys.theme, value: request.payload })

      await sendMessageToContentScript({
        type: ContentScriptServerEndpoints.themeChanged,
        payload: request.payload
      })

      return true
    }

    return super.handle(request)
  }
}

export default SetThemeHandler
