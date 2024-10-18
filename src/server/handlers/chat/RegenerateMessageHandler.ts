import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import generateTitle from '@/server/utils/chat/generateTitle'
import getOrCreateConversation from '@/server/utils/chat/getOrCreateConversation'
import streamChatMessage from '@/server/utils/chat/streamChatMessage'
import { db } from '@/shared/db'
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
}

class RegenerateMessageHandler extends AbstractHandler<
  ExtendedEvent<RegenerateMessageRequest>,
  Promise<void>
> {
  public async handle(request: ExtendedEvent<RegenerateMessageRequest>): Promise<void> {
    if (request.type === ServerEndpoints.regenerateResponse) {
      const { conversationId, modelId } = request.payload

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

      // Remove the last message
      await db.messages.where({ id: lastMessage.id }).delete()

      const success = await streamChatMessage({
        conversation,
        modelId,
        port: request.port
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
