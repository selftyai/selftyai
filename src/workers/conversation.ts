import { CoreMessage, UserContent } from 'ai'
import { streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider'

import OllamaService from '@/services/ollama/OllamaService'
import { Provider } from '@/services/types/Provider'
import { processChatStream } from '@/utils/stream'
import type { Conversation, Message } from '@/workers/types'
import { getDataFromStorage } from '@/workers/utils'

const updateConversation = async (conversation: Conversation) => {
  const conversations = (await getDataFromStorage<Conversation[]>('conversations')) || []

  const index = conversations.findIndex((c) => c.id === conversation.id)

  conversations[index] = conversation

  await chrome.storage.local.set({ conversations: JSON.stringify(conversations) })
}

export const createConversation = async (message: {
  type: string
  conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>
}) => {
  const id = crypto.randomUUID()

  const conversations = (await getDataFromStorage<Conversation[]>('conversations')) || []

  const conversation = {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...message.conversation
  }

  conversations.push(conversation)

  await chrome.storage.local.set({ conversations: JSON.stringify(conversations) })

  return {
    conversation
  }
}

export const getConversations = async () => {
  return {
    conversations: (await getDataFromStorage<Conversation[]>('conversations')) || []
  }
}

const getModelByProvider = async (provider: Provider) => {
  switch (provider) {
    case Provider.OLLAMA: {
      const ollamaService = OllamaService.getInstance()

      return createOllama({
        baseURL: `${await ollamaService.getBaseURL()}/api`
      })
    }
  }
}

export const sendMessage = async (message: {
  type: string
  conversation: Conversation
  content: UserContent
  port: chrome.runtime.Port
}) => {
  const { conversation, content, port } = message

  const provider = await getModelByProvider(conversation.provider)

  const userContent = {
    role: 'user',
    content
  } as CoreMessage

  const result = await streamText({
    model: provider(conversation.model),
    system: conversation.systemMessage,
    messages: [...conversation.messages, userContent]
  })

  const responseMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  } as Message

  await updateConversation({
    ...conversation,
    messages: [
      ...conversation.messages,
      {
        ...userContent,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      responseMessage
    ]
  })

  processChatStream(
    result.toDataStream(),
    (data) => {
      const formatted = data.split(':')

      if (formatted[0] === '0') {
        port.postMessage({
          type: 'partialMessage',
          chatId: conversation.id,
          messageId: responseMessage.id,
          content: formatted[1].substring(1, formatted[1].length - 2)
        })
      }
    },
    () => {
      port.postMessage({
        type: 'finalMessage',
        chatId: conversation.id,
        messageId: responseMessage.id
      })
    }
  )
}
