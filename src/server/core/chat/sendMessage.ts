/* eslint-disable @typescript-eslint/no-explicit-any */
import { CoreMessage } from 'ai'

import createConversation from '@/server/core/chat/createConversation'
import generateTitle from '@/server/core/chat/generateTitle'
import getConversations from '@/server/core/chat/getConversations'
import saveConversation from '@/server/core/chat/saveConversation'
import streamChatMessage from '@/server/core/chat/streamChatMessage'
import { StateStorage } from '@/server/types/Storage'
import { AIProvider } from '@/shared/types/AIProvider'
import { createMessage } from '@/shared/types/Message'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface sendMessagePayload {
  chatId: string
  message: CoreMessage
  context: string
  userMessage: string
  model: {
    provider: AIProvider
    model: string
  }
  broadcastMessage: (data: any) => void
  storage: StateStorage
  port: chrome.runtime.Port
}

const sendMessage = async ({
  chatId,
  message,
  context,
  userMessage,
  model,
  broadcastMessage,
  storage,
  port
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

  // User message
  conversation.messages.push(
    createMessage({
      id: crypto.randomUUID(),
      context,
      userMessage,
      ...message
    })
  )
  await saveConversation(conversation, storage)

  broadcastMessage({
    type: 'selectConversation',
    conversationId: conversation.id,
    ...(await getConversations({ storage })),
    messages: conversation.messages
  })

  const created = await streamChatMessage({
    chatId,
    conversation,
    broadcastMessage,
    port,
    storage
  })

  if (conversation.title === 'New conversation' && created) {
    const title = await generateTitle(conversation)

    conversation.title = title
    await saveConversation(conversation, storage)

    broadcastMessage({
      type: ServerEndpoints.getConversations,
      ...(await getConversations({ storage }))
    })
  }
}

export default sendMessage
