import generateTitle from '@/server/core/chat/generateTitle'
import streamChatMessage from '@/server/core/chat/streamChatMessage'
import { db } from '@/shared/db'

interface sendMessagePayload {
  conversationId: number
  modelId: number
  port: chrome.runtime.Port
}

const regenerateResponse = async ({ conversationId, modelId, port }: sendMessagePayload) => {
  const conversation = await db.conversations.where({ id: conversationId }).first()

  if (!conversation) {
    console.warn('[ContinueGenerating] Conversation not found:', conversationId)
    return
  }

  const lastMessage = await db.messages.where({ conversationId }).last()

  if (lastMessage?.role !== 'assistant') {
    console.warn('[ContinueGenerating] Last message is not an assistant message:', lastMessage)
    return
  }

  await db.conversations.where({ id: conversationId }).modify({
    modelId
  })

  // Remove the last message
  await db.messages.where({ id: lastMessage.id }).delete()

  const created = await streamChatMessage({
    conversationId,
    modelId,
    port
  })

  if (!created) {
    return
  }

  await generateTitle(conversationId)
}

export default regenerateResponse
