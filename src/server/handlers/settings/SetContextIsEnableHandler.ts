import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import { db } from '@/shared/db'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import { ContentScriptServerEndpoints } from '@/shared/types/ContentScriptEndpoints'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import sendMessageToContentScript from '@/shared/utils/sendMessageToContentScript'

class SetContextIsEnableHandler extends AbstractHandler<MessageEvent<boolean>, Promise<boolean>> {
  public async handle(request: MessageEvent<boolean>): Promise<boolean> {
    if (request.type === ServerEndpoints.setIsContextEnabled) {
      await db.settings.put({
        key: SettingsKeys.isContextEnable,
        value: request.payload.toString()
      })

      await sendMessageToContentScript({
        type: ContentScriptServerEndpoints.setContextIsEnable,
        payload: request.payload
      })

      return true
    }

    return super.handle(request)
  }
}

export default SetContextIsEnableHandler
