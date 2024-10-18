import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface SetMessageContextRequest {
  /**
   * Text context to set
   */
  context: string
}

class SetMessageContextHandler extends AbstractHandler<
  ExtendedEvent<SetMessageContextRequest>,
  Promise<void>
> {
  public async handle(request: ExtendedEvent<SetMessageContextRequest>): Promise<void> {
    if (request.type === ServerEndpoints.setMessageContext) {
      const { context } = request.payload

      const interval = setInterval(() => {
        const isSidebarOpen = this.checkIsSidebarOpen(request)

        if (isSidebarOpen) {
          request.broadcastMessage({
            type: ServerEndpoints.setMessageContext,
            payload: {
              context
            }
          })
          clearInterval(interval)
        }
      }, 100)

      return
    }

    return super.handle(request)
  }

  private checkIsSidebarOpen(request: ExtendedEvent<SetMessageContextRequest>) {
    return request
      .getConnectedPorts()
      .some(
        ({ sender }) => sender?.origin === `chrome-extension://${chrome.runtime.id}` && !sender?.tab
      )
  }
}

export default SetMessageContextHandler
