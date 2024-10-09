/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText, CoreMessage } from 'ai'

import createConversation from '@/server/core/chat/createConversation'
import getConversations from '@/server/core/chat/getConversations'
import getProvider from '@/server/core/chat/getProvider'
import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { processChatStream } from '@/server/utils/stream'
import { AIProvider } from '@/shared/types/AIProvider'
import { Message } from '@/shared/types/Message'

import generateTitle from './generateTitle'

interface sendMessagePayload {
  chatId: string
  message: CoreMessage
  model: {
    provider: AIProvider
    model: string
  }
  broadcastMessage: (data: any) => void
  storage: StateStorage
}

const sendMessage = async ({
  chatId,
  message,
  model,
  broadcastMessage,
  storage
}: sendMessagePayload) => {
  const { conversations } = await getConversations({ storage })

  const conversation =
    conversations.find((conversation) => conversation.id === chatId) ??
    (await createConversation(
      {
        title: 'New conversation',
        ...model,
        systemMessage: ''
      },
      storage
    ))

  const { conversations: actualConversations } = await getConversations({ storage })

  const index = actualConversations.findIndex((c) => c.id === conversation.id)

  if (index === -1) {
    throw new Error('Conversation not found')
  }

  const messageToSendSave = {
    id: crypto.randomUUID(),
    ...message,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Message

  actualConversations[index].messages.push(messageToSendSave)

  broadcastMessage({
    type: 'selectConversation',
    conversationId: actualConversations[index].id,
    conversations: actualConversations,
    messages: actualConversations[index].messages
  })

  const provider = getProvider(conversation.provider)

  const result = await streamText({
    model: provider(conversation.model),
    system: actualConversations[index].systemMessage,
    messages: actualConversations[index].messages
  })

  const responseMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  } as Message
  actualConversations[index].messages.push(responseMessage)

  await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(actualConversations))

  processChatStream(
    result.toDataStream(),
    async (data) => {
      const subtracted = data.substring('0:'.length, data.length - 1)
      const parsedData = JSON.parse(subtracted)

      if (typeof parsedData !== 'string') {
        console.log('Metadata: ', parsedData)
      }

      if (typeof parsedData === 'string') {
        responseMessage.content += parsedData

        actualConversations[index].messages[actualConversations[index].messages.length - 1] =
          responseMessage
        await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(actualConversations))

        try {
          broadcastMessage({
            type: 'partialMessage',
            payload: {
              chatId: conversation.id,
              messages: actualConversations[index].messages
            }
          })
        } catch (error) {
          console.error('Error sending partial message', error)
        }
      }
    },
    async () => {
      broadcastMessage({
        type: 'finalMessage',
        payload: {
          chatId: conversation.id,
          conversations: (await getConversations({ storage })).conversations
        }
      })

      if (conversation.title === 'New conversation') {
        const title = await generateTitle(actualConversations[index])

        actualConversations[index].title = title
        await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(actualConversations))

        broadcastMessage({
          type: 'getConversations',
          conversations: actualConversations
        })
      }
    }
  )
}

export default sendMessage
