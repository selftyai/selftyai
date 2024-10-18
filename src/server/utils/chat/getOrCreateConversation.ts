import { db } from '@/shared/db'
import { Conversation } from '@/shared/db/models/Conversation'

async function createConversation(
  conversation: Omit<Conversation, 'pinned' | 'generating' | 'createdAt' | 'updatedAt'>
): Promise<Conversation> {
  const conversationId = await db.conversations.add(conversation)

  return (await db.conversations.get(conversationId)) as Conversation
}

export default async function getOrCreateConversation(
  conversationToGet: Omit<Conversation, 'pinned' | 'generating' | 'createdAt' | 'updatedAt'>
): Promise<Conversation> {
  if (!conversationToGet.id) return await createConversation(conversationToGet)

  const conversation = await db.conversations.get(conversationToGet.id)
  if (!conversation) {
    return await createConversation(conversationToGet)
  }

  return conversation
}
