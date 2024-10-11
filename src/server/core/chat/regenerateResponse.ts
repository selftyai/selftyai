/* eslint-disable @typescript-eslint/no-explicit-any */
import generateTitle from '@/server/core/chat/generateTitle'
import getConversations from '@/server/core/chat/getConversations'
import saveConversation from '@/server/core/chat/saveConversation'
import streamChatMessage from '@/server/core/chat/streamChatMessage'
import type { StateStorage } from '@/server/types/Storage'
import type { Model } from '@/shared/types/Model'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface sendMessagePayload {
  chatId: string
  model: Model
  broadcastMessage: (data: any) => void
  storage: StateStorage
  port: chrome.runtime.Port
}

const sendMessage = async ({
  chatId,
  model,
  broadcastMessage,
  storage,
  port
}: sendMessagePayload) => {
  const { conversations } = await getConversations({ storage })

  const conversation = conversations.find((conversation) => conversation.id === chatId)

  if (!conversation) {
    return
  }
  conversation.model = model.model
  conversation.provider = model.provider

  // Remove the last message (Assistant message)
  conversation.messages.pop()
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
