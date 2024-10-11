import * as core from '@/server/core'
import { checkOngoingPulls } from '@/server/core/ollama/ollamaPullModel'
import { ServerEndpoints } from '@/server/types/ServerEndpoints'

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

const handlers = {
  [ServerEndpoints.ollamaModels]: core.ollamaModels,
  [ServerEndpoints.ollamaVerifyConnection]: core.ollamaVerifyConnection,
  [ServerEndpoints.ollamaPullModel]: core.ollamaPullModel,
  [ServerEndpoints.ollamaDeleteModel]: core.deleteModel,
  [ServerEndpoints.getConversations]: core.getConversations,
  [ServerEndpoints.sendMessage]: core.sendMessage,
  [ServerEndpoints.deleteConversation]: core.deleteConversation,
  [ServerEndpoints.ollamaChangeUrl]: core.changeBaseUrl,
  [ServerEndpoints.sidePanelHandlerer]: core.sidePanelHandlerer,
  [ServerEndpoints.setMessageContext]: core.setMessageContext
}

const connectedPorts: chrome.runtime.Port[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function broadcastMessage(message: any) {
  connectedPorts.forEach((port) => {
    port.postMessage(message)
  })
}

chrome.runtime.onConnect.addListener((port) => {
  connectedPorts.push(port)

  checkOngoingPulls(broadcastMessage)

  port.onDisconnect.addListener(() => {
    const index = connectedPorts.indexOf(port)
    if (index > -1) {
      connectedPorts.splice(index, 1)
    }
  })

  port.onMessage.addListener(async (message) => {
    const { type, payload } = message

    const handler = handlers[type as keyof typeof handlers]

    if (!handler) {
      console.error(`Unknown message type: ${type}`)
      return
    }

    console.log(`Received message: ${type}`)

    try {
      const response = await handler({ ...payload, broadcastMessage })
      port.postMessage({ type, ...response })
    } catch (error: unknown) {
      port.postMessage({ type, error: error instanceof Error ? error.message : String(error) })
    }
  })
})
