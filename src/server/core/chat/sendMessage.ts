/* eslint-disable @typescript-eslint/no-explicit-any */
import generateTitle from '@/server/core/chat/generateTitle'
import streamChatMessage from '@/server/core/chat/streamChatMessage'
import { db } from '@/shared/db'
import { File } from '@/shared/db/models/File'

interface sendMessagePayload {
  conversationId?: number
  modelId: number
  message: string
  files: Omit<File, 'conversationId' | 'messageId'>[]
  broadcastMessage: (data: any) => void
  port: chrome.runtime.Port
}

const sendMessage = async ({
  conversationId: chatId,
  message,
  modelId,
  files,
  broadcastMessage,
  port
}: sendMessagePayload) => {
  const conversationId = chatId
    ? ((await db.conversations.where({ id: chatId }).first())?.id ??
      (await db.conversations.add({
        title: 'New chat',
        systemMessage: '',
        modelId
      })))
    : await db.conversations.add({
        title: 'New chat',
        systemMessage: '',
        modelId
      })

  // Update the model ID of the conversation
  await db.conversations.where({ id: conversationId }).modify({
    modelId
  })

  // Add user message to the database
  const messageId = await db.messages.add({
    conversationId,
    modelId,
    role: 'user',
    content: message
  })

  if (files.length > 0) {
    await db.files.bulkAdd(
      files.map((data) => ({
        conversationId,
        messageId,
        ...data
      }))
    )
  }

  broadcastMessage({
    type: 'selectConversation',
    conversationId
  })

  const created = await streamChatMessage({
    conversationId,
    port,
    modelId
  })

  if (!created) {
    return
  }

  await generateTitle(conversationId)
}

export default sendMessage
