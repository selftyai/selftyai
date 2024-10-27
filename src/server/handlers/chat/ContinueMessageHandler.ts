import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'
import generateTitle from '@/server/utils/chat/generateTitle'
import getOrCreateConversation from '@/server/utils/chat/getOrCreateConversation'
import streamChatMessage from '@/server/utils/chat/streamChatMessage'
import { db } from '@/shared/db'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

interface ContinueMessageRequest {
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
}

class ContinueMessageHandler extends AbstractHandler<
  ExtendedEvent<ContinueMessageRequest>,
  Promise<void>
> {
  public async handle(request: ExtendedEvent<ContinueMessageRequest>): Promise<void> {
    if (request.type === ServerEndpoints.continueGenerating) {
      const { conversationId, modelId } = request.payload

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

      const success = await streamChatMessage({
        conversation,
        modelId,
        port: request.port,
        useLastMessage: true,
        tools: request.payload.tools
      })

      if (success) {
        await generateTitle(conversation.id!)
      }

      return
    }

    return super.handle(request)
  }
}

export default ContinueMessageHandler
