import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import generateTitle from '@/server/utils/chat/generateTitle'
import getOrCreateConversation from '@/server/utils/chat/getOrCreateConversation'
import streamChatMessage from '@/server/utils/chat/streamChatMessage'
import { db } from '@/shared/db'
import { File } from '@/shared/db/models/File'
import { Message } from '@/shared/db/models/Message'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface GenerateMessageRequest {
  /**
   * Conversation ID to send the message to
   */
  conversationId?: number
  /**
   * Model ID (`models` table) which generates the message
   */
  modelId: number
  /**
   * Raw message content
   */
  message: string
  /**
   * Array of files to attach to the message
   */
  files: Omit<File, 'conversationId' | 'messageId'>[]
  /**
   * Array of tools to use for the message
   */
  tools: string[]
  /**
   * Parent message ID
   */
  parentMessageId?: number
}

class GenerateMessageHandler extends AbstractHandler<
  ExtendedEvent<GenerateMessageRequest>,
  Promise<void>
> {
  public async handle(request: ExtendedEvent<GenerateMessageRequest>): Promise<void> {
    if (request.type === ServerEndpoints.sendMessage) {
      const { conversationId, message, modelId, files, parentMessageId } = request.payload

      const conversation = await getOrCreateConversation({
        id: conversationId,
        modelId,
        title: 'New chat',
        systemMessage: ''
      })

      // Update the model ID of the conversation
      await db.conversations.where({ id: conversation.id }).modify({
        modelId
      })

      // Add user message to the database
      const messageId = await db.messages.add({
        conversationId: conversation.id!,
        modelId,
        role: 'user',
        content: message,
        parentMessageId
      })

      if (files.length > 0) {
        await db.files.bulkAdd(
          files.map((data) => ({
            conversationId: conversation.id!,
            messageId,
            ...data
          }))
        )
      }

      request.broadcastMessage({
        type: 'selectConversation',
        payload: {
          conversationId: conversation.id
        }
      })

      const assistantMessageId = await db.messages.add({
        role: 'assistant',
        content: '',
        conversationId: conversation.id!,
        modelId,
        availableTools: request.payload.tools,
        parentMessageId: messageId
      })

      const branch = await db.branches.where({ conversationId: conversation.id }).first()

      if (branch) {
        await db.branches.where({ conversationId: conversation.id }).modify({
          branchPath: [...branch.branchPath, assistantMessageId]
        })
      }

      const success = await streamChatMessage({
        conversation,
        modelId,
        port: request.port,
        tools: request.payload.tools,
        assistantMessage: (await db.messages.get(assistantMessageId)) as Message
      })

      if (success) {
        await generateTitle(conversation.id!)
      }

      return
    }

    return super.handle(request)
  }
}

export default GenerateMessageHandler
