import { CoreMessage, streamText } from 'ai'

import getProvider from '@/server/core/chat/getProvider'
import { db } from '@/shared/db'

interface StreamChatMessageProps {
  conversationId: number
  modelId: number
  port: chrome.runtime.Port
  useLastMessage?: boolean
}

const streamChatMessage = async ({
  conversationId,
  modelId,
  port,
  useLastMessage = false
}: StreamChatMessageProps) => {
  const abortController = new AbortController()

  const model = await db.models.where({ id: modelId }).first()

  if (!model) {
    console.warn('[streamChatMessage] Model not found:', modelId)
    return false
  }

  const assistantMessageId = useLastMessage
    ? (await db.messages.where({ conversationId, role: 'assistant' }).last())?.id
    : await db.messages.add({
        role: 'assistant',
        content: '',
        conversationId,
        modelId
      })

  if (!assistantMessageId) {
    console.warn('[streamChatMessage] Assistant message not found')
    return false
  }

  await db.messages.where({ conversationId, role: 'assistant' }).modify({
    error: undefined,
    finishReason: undefined
  })

  port.onMessage.addListener(async (message) => {
    if (message.type === 'stop' && message.payload.conversationId === conversationId) {
      abortController.abort()
    }
  })

  const conversation = await db.conversations.get(conversationId)

  if (!conversation) {
    console.warn('[streamChatMessage] Conversation not found:', conversationId)
    return false
  }

  const messages = await db.messages.where({ conversationId }).toArray()
  const files = await db.files.where({ conversationId }).toArray()

  const mappedMessages: CoreMessage[] = messages.map((message) => {
    if (message.role === 'assistant') {
      return {
        role: 'assistant',
        content: message.content
      } as CoreMessage
    }

    const relevantFiles = files.filter((f) => f.messageId === message.id)

    return {
      role: 'user',
      content: [
        {
          type: 'text',
          text: message.content
        },
        ...relevantFiles.map((file) => ({
          type: 'image',
          image: file.data
        }))
      ]
    } as CoreMessage
  })

  await db.conversations.update(conversationId, {
    generating: true
  })

  try {
    const provider = getProvider(model.provider)

    const startRequest = new Date()
    const { textStream, usage, finishReason } = await streamText({
      model: provider(model.model),
      system: conversation.systemMessage,
      messages: mappedMessages,
      abortSignal: abortController.signal
    })
    const endRequest = new Date()

    const startedAt = new Date()
    for await (const textPart of textStream) {
      const assistantMessage = await db.messages.where({ id: assistantMessageId }).first()

      if (!assistantMessage) {
        console.warn('[streamChatMessage] Assistant message not found:', assistantMessageId)
        return false
      }

      await db.messages.update(assistantMessageId, {
        content: assistantMessage.content + textPart
      })
    }
    const endAt = new Date()

    const usageData = await usage

    await db.conversations.update(conversationId, {
      generating: false
    })

    await db.messages.update(assistantMessageId, {
      waitingTime: endRequest.getTime() - startRequest.getTime(),
      responseTime: endAt.getTime() - startedAt.getTime(),
      promptTokens: usageData.promptTokens,
      completionTokens: usageData.completionTokens,
      totalTokens: usageData.totalTokens,
      finishReason: await finishReason
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      const finishReason = error.name === 'AbortError' ? 'aborted' : 'error'
      const errorName = error.name === 'AbortError' ? 'AbortedError' : 'NetworkError'

      await db.messages.update(assistantMessageId, {
        finishReason,
        error: errorName
      })
    }

    await db.conversations.update(conversationId, {
      generating: false
    })

    return false
  }

  return true
}

export default streamChatMessage
