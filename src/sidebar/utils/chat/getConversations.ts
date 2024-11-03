import { db } from '@/shared/db'
import { ConversationWithLastMessage } from '@/sidebar/types/ConversationWithLastMessage'

export default async function getConversations() {
  const conversations = await db.conversations.toArray()

  const conversationsWithLastMessage: ConversationWithLastMessage[] = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await db.messages.where({ conversationId: conversation.id }).last()

      return {
        ...conversation,
        lastMessageAt: lastMessage?.updatedAt
      }
    })
  )

  return conversationsWithLastMessage
}
