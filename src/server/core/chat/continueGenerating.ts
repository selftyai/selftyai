/* eslint-disable @typescript-eslint/no-explicit-any */
import generateTitle from '@/server/core/chat/generateTitle'
import getConversations from '@/server/core/chat/getConversations'
import saveConversation from '@/server/core/chat/saveConversation'
import streamChatMessage from '@/server/core/chat/streamChatMessage'
import type { StateStorage } from '@/server/types/Storage'
import type { Model } from '@/shared/types/Model'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface ContinueGeneratingPayload {
  chatId: string
  model: Model
  broadcastMessage: (data: any) => void
  storage: StateStorage
  port: chrome.runtime.Port
}

const continueGenerating = async ({
  chatId,
  model,
  broadcastMessage,
  storage,
  port
}: ContinueGeneratingPayload) => {
  const { conversations } = await getConversations({ storage })
  const conversation = conversations.find((conversation) => conversation.id === chatId)

  if (!conversation) {
    console.warn('[ContinueGenerating] No conversation found for chatId:', chatId)
    return
  }

  const lastMessage = conversation.messages[conversation.messages.length - 1]

  if (lastMessage?.role !== 'assistant') {
    console.warn('[ContinueGenerating] Last message is not an assistant message:', lastMessage)
    return
  }

  if (lastMessage?.finishReason !== 'aborted' && lastMessage?.error !== 'AbortedError') {
    console.warn('[ContinueGenerating] Last message is not an AbortedError', lastMessage)
    return
  }

  conversation.model = model.model
  conversation.provider = model.provider
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
    storage,
    useLastMessage: true
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

export default continueGenerating
