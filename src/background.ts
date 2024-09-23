import { createConversation, getConversations, sendMessage } from '@/workers/conversation'
import { getModels } from '@/workers/models'
import { isConnected } from '@/workers/models/ollama'

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

const chatTypes = {
  createConversation,
  getConversations,
  sendMessage
}

const ollamaTypes = {
  connected: isConnected,
  getModels
}

chrome.runtime.onConnect.addListener(function (port) {
  switch (port.name) {
    case 'ollama':
      port.onMessage.addListener(async (message) => {
        const { type } = message

        const ollamaType = ollamaTypes[type as keyof typeof ollamaTypes]

        if (ollamaType) {
          const response = await ollamaType()
          port.postMessage({
            type,
            ...response
          })
        }
      })
      break
    case 'chat':
      port.onMessage.addListener(async (message) => {
        const { type } = message

        const chatType = chatTypes[type as keyof typeof chatTypes]

        if (chatType) {
          const response = await chatType({ ...message, port })
          port.postMessage({
            type,
            ...response
          })
        }
      })
      break
  }
})
