import { CoreMessage } from 'ai'

import { ChatService } from '@/services/chat/ChatService'
import { AIProvider } from '@/types/AIProvider'
import { createConversation } from '@/workers/conversation'
import { getModels } from '@/workers/models'
import { isConnected } from '@/workers/models/ollama'

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

const handlers = {
  createConversation,
  getConversations: async () => {
    const chatService = ChatService.getInstance()
    const conversations = await chatService.getConversations()

    return { conversations }
  },
  sendMessage: async ({
    chatId,
    message,
    model,
    port
  }: {
    chatId: string
    message: CoreMessage
    model: {
      provider: AIProvider
      model: string
    }
    port: chrome.runtime.Port
  }) => {
    const chatService = ChatService.getInstance()
    const conversations = await chatService.getConversations()

    const conversation =
      conversations.find((conversation) => conversation.id === chatId) ??
      (await chatService.createConversation({
        title: 'New conversation',
        ...model,
        systemMessage: ''
      }))

    port.postMessage({
      type: 'selectConversation',
      conversation,
      conversations: await chatService.getConversations()
    })

    await chatService.sendMessage(conversation.id, message, port)
  },
  deleteConversation: async ({ id }: { id: string }) => {
    const chatService = ChatService.getInstance()
    await chatService.deleteConversation(id)

    return { conversations: await chatService.getConversations(), payload: { id } }
  },
  connected: isConnected,
  getModels
}

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (message) => {
    const { type, payload } = message

    const handler = handlers[type as keyof typeof handlers]

    if (handler) {
      try {
        const response = await handler({ ...payload, port })
        port.postMessage({ type, ...response })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        port.postMessage({ type, error: error.message })
      }
    } else {
      port.postMessage({ type, error: 'Unknown message type' })
    }
  })
})
