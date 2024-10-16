import * as core from '@/server/core'
import monitorModels from '@/server/core/ollama/monitorModels'
import { checkOngoingPulls } from '@/server/core/ollama/ollamaPullModel'
import { createChromeStorage } from '@/server/utils/chromeStorage'
import { db } from '@/shared/db'
import printBuildInfo from '@/shared/printBuildInfo'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

;(() => {
  printBuildInfo()

  chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true })

  monitorModels()
  // Abort ongoing conversations on startup
  db.conversations.toArray().then((conversations) => {
    const ongoingConversations = conversations.filter((conversation) => conversation.generating)

    ongoingConversations.forEach(async (conversation) => {
      const message = await db.messages.where({ conversationId: conversation.id }).last()

      if (!message?.id || !conversation?.id) {
        return
      }

      await db.messages.update(message.id, {
        error: 'AbortedError',
        finishReason: 'aborted'
      })

      await db.conversations.update(conversation.id, {
        generating: false
      })
    })
  })
})()

const handlers = {
  [ServerEndpoints.ollamaModels]: () => {},
  [ServerEndpoints.ollamaVerifyConnection]: core.ollamaVerifyConnection,
  [ServerEndpoints.ollamaPullModel]: core.ollamaPullModel,
  [ServerEndpoints.ollamaDeleteModel]: core.deleteModel,
  [ServerEndpoints.sendMessage]: core.sendMessage,
  [ServerEndpoints.regenerateResponse]: core.regenerateResponse,
  [ServerEndpoints.stop]: () => {},
  [ServerEndpoints.continueGenerating]: core.continueGenerating
}

const connectedPorts: chrome.runtime.Port[] = []
const storage = createChromeStorage('local')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function broadcastMessage(message: any) {
  connectedPorts.forEach((port) => {
    port.postMessage(message)
  })
}

checkOngoingPulls(broadcastMessage)
setInterval(monitorModels, 1000 * 5)

chrome.runtime.onConnect.addListener((port) => {
  connectedPorts.push(port)

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
      console.warn('[Connect Message Handler] No handler found for message type:', type)
      return
    }

    try {
      console.log(
        `[Connect Message Handler] Received message with type: ${type} and payload`,
        payload
      )

      const response = await handler({ ...payload, storage, port, broadcastMessage })
      port.postMessage({ type, ...response })
    } catch (error: unknown) {
      console.warn(
        `[Connect Message Handler] Error while handling message: ${type}`,
        error instanceof Error ? error.message : error
      )
    }
  })
})

const messageHandlers = {
  [ServerEndpoints.getCurrentLanguage]: core.getCurrentLanguage,
  [ServerEndpoints.changeLanguage]: core.changeLanguage
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message

  const syncStorage = createChromeStorage('sync')

  const handler = messageHandlers[type as keyof typeof messageHandlers]
  if (!handler) {
    console.warn(`[${sender.id}][Message Handler] No handler found for message type:`, type)
    sendResponse({ error: 'No handler found for message type' })
    return
  }

  console.log(
    `[${sender.id}][Message Handler] Received message with type: ${type} and payload`,
    payload
  )

  handler({ payload, syncStorage }).then((response) => {
    console.log(
      `[${sender.id}][Message Handler] Sending response for message type: ${type}`,
      response
    )

    sendResponse(response)
  })

  return true
})
