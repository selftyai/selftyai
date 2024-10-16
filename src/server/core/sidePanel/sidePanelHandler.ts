import { SidePanelAction } from '@/server/types/sidePanel/SidePanelActions'

interface OpenSidePanelPayload {
  action: SidePanelAction
}

const sidePanelHandler = async ({ action }: OpenSidePanelPayload) => {
  const handleSidePanelAction = (windowId: number | undefined) => {
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

  chrome.windows.getCurrent({ populate: true }, (window) => {
    handleSidePanelAction(window.id)
  })
}

export default sidePanelHandler
