/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from 'ai'

import getConversations from '@/server/core/chat/getConversations'
import getProvider from '@/server/core/chat/getProvider'
import saveConversation from '@/server/core/chat/saveConversation'
import { StateStorage } from '@/server/types/Storage'
import { Conversation } from '@/shared/types/Conversation'
import { createMessage } from '@/shared/types/Message'

interface StreamChatMessageProps {
  chatId: string
  conversation: Conversation
  broadcastMessage: (data: any) => void
  storage: StateStorage
  port: chrome.runtime.Port
  useLastMessage?: boolean
}

const streamChatMessage = async ({
  conversation,
  broadcastMessage,
  port,
  storage,
  useLastMessage = false
}: StreamChatMessageProps) => {
  const abortController = new AbortController()

  const assistantMessage = useLastMessage
    ? conversation.messages[conversation.messages.length - 1]
    : createMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: ''
      })

  if (!useLastMessage) {
    conversation.messages.push(assistantMessage)
  }

  assistantMessage.error = undefined
  assistantMessage.finishReason = undefined

  await saveConversation(conversation, storage)

  port.onMessage.addListener(async (message) => {
    if (message.type === 'stop' && message.payload.chatId === conversation.id) {
      abortController.abort()
    }
  })

  try {
    const provider = getProvider(conversation.provider)

    const startRequest = new Date()
    const { textStream, usage, finishReason } = await streamText({
      model: provider(conversation.model),
      system: conversation.systemMessage,
      messages: conversation.messages,
      abortSignal: abortController.signal
    })
    const endRequest = new Date()

    const startedAt = new Date()
    let lastUpdate = Date.now()
    for await (const textPart of textStream) {
      assistantMessage.content += textPart

      const now = Date.now()
      if (now - lastUpdate > 100) {
        await saveConversation(conversation, storage)
        broadcastMessage({
          type: 'partialMessage',
          payload: {
            chatId: conversation.id,
            messages: conversation.messages
          }
        })
        lastUpdate = now
      }
    }
    const endAt = new Date()

    assistantMessage.responseTime = endAt.getTime() - startedAt.getTime()
    assistantMessage.usage = await usage
    assistantMessage.waitingTime = endRequest.getTime() - startRequest.getTime()
    assistantMessage.finishReason = await finishReason
    await saveConversation(conversation, storage)
  } catch (error: unknown) {
    if (error instanceof Error) {
      assistantMessage.finishReason = 'error'

      if (error.message === 'network error') {
        assistantMessage.error = 'NetworkError'
      } else if (error.name === 'AbortError') {
        assistantMessage.error = 'AbortedError'
        assistantMessage.finishReason = 'aborted'
      }

      await saveConversation(conversation, storage)
    }

    broadcastMessage({
      type: 'partialMessage',
      payload: {
        chatId: conversation.id,
        messages: conversation.messages
      }
    })

    broadcastMessage({
      type: 'finalMessage',
      payload: {
        chatId: conversation.id,
        ...(await getConversations({ storage }))
      }
    })
    return false
  }

  broadcastMessage({
    type: 'partialMessage',
    payload: {
      chatId: conversation.id,
      messages: conversation.messages
    }
  })

  broadcastMessage({
    type: 'finalMessage',
    payload: {
      chatId: conversation.id,
      ...(await getConversations({ storage }))
    }
  })

  return true
}

export default streamChatMessage
