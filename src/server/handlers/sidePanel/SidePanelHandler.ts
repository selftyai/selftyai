import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import { SidePanelAction } from '@/server/types/sidePanel/SidePanelActions'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface SidePanelRequest {
  action: SidePanelAction
}

class SidePanelHandler extends AbstractHandler<ExtendedEvent<SidePanelRequest>, Promise<boolean>> {
  public async handle(request: ExtendedEvent<SidePanelRequest>): Promise<boolean> {
    if (request.type === ServerEndpoints.sidePanelHandler) {
      const { action } = request.payload

      chrome.windows.getCurrent({ populate: true }, (window) =>
        this.handleSidePanelAction(action, window.id)
      )

      return true
    }

    return super.handle(request)
  }

  private handleSidePanelAction(action: SidePanelAction, windowId: number | undefined) {
    if (windowId === undefined) return

    if (action === SidePanelAction.OPEN) {
      chrome.sidePanel.open({ windowId })
      return
    }

    if (action === SidePanelAction.CLOSE) {
      chrome.sidePanel.setOptions({ enabled: false })
      setTimeout(() => {
        chrome.sidePanel.setOptions({ enabled: true })
      }, 100)
    }
  }
}

export default SidePanelHandler
