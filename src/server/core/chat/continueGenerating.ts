import generateTitle from '@/server/core/chat/generateTitle'
import streamChatMessage from '@/server/core/chat/streamChatMessage'
import { db } from '@/shared/db'

interface ContinueGeneratingPayload {
  conversationId: number
  modelId: number
  port: chrome.runtime.Port
}

const continueGenerating = async ({ conversationId, modelId, port }: ContinueGeneratingPayload) => {
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

  if (lastMessage?.finishReason !== 'aborted' && lastMessage?.error !== 'AbortedError') {
    console.warn('[ContinueGenerating] Last message is not an AbortedError', lastMessage)
    return
  }

  await db.conversations.where({ id: conversationId }).modify({
    modelId
  })

  const created = await streamChatMessage({
    conversationId,
    modelId,
    port,
    useLastMessage: true
  })

  if (!created) {
    return
  }

  await generateTitle(conversationId)
}

export default continueGenerating
