import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import generateTitle from '@/server/utils/chat/generateTitle'
import getOrCreateConversation from '@/server/utils/chat/getOrCreateConversation'
import streamChatMessage from '@/server/utils/chat/streamChatMessage'
import { db } from '@/shared/db'
import { Message } from '@/shared/db/models/Message'
import logger from '@/shared/logger'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface RegenerateMessageRequest {
  /**
   * Conversation ID to send the message to
   */
  conversationId?: number
  /**
   * Model ID (`models` table) which generates the message
   */
  modelId: number
  /**
   * Array of tools to use for the message
   */
  tools: string[]
  messageId: number
}

class RegenerateMessageHandler extends AbstractHandler<
  ExtendedEvent<RegenerateMessageRequest>,
  Promise<void>
> {
  public async handle(request: ExtendedEvent<RegenerateMessageRequest>): Promise<void> {
    if (request.type === ServerEndpoints.regenerateResponse) {
      const { conversationId, modelId, messageId } = request.payload

      const conversation = await getOrCreateConversation({
        id: conversationId,
        modelId,
        title: 'New chat',
        systemMessage: ''
      })

      const lastMessage = await db.messages.where({ conversationId }).last()

      if (lastMessage?.role !== 'assistant') {
        console.warn('[ContinueGenerating] Last message is not an assistant message:', lastMessage)
        return
      }

      // Update the model ID of the conversation
      await db.conversations.where({ id: conversation.id }).modify({
        modelId
      })

      const lastUserMessage = await db.messages.get(messageId)

      if (!lastUserMessage) {
        logger.warn(
          '[RegenerateMessageHandler] No user message found in conversation:',
          conversationId
        )
        return
      }

      const assistantMessageId = await db.messages.add({
        role: 'assistant',
        content: '',
        conversationId: conversation.id!,
        modelId,
        availableTools: request.payload.tools,
        parentMessageId: lastUserMessage.id
      })

      const branch = await db.branches.where({ conversationId: conversation.id }).first()

      if (branch) {
        await db.branches.where({ id: branch.id }).modify({
          branchPath: []
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

export default RegenerateMessageHandler
