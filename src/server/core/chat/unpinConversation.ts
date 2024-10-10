import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { Conversation } from '@/shared/types/Conversation'

interface GetConversationsPayload {
  storage: StateStorage
  id: string
}

const unpinConversation = async ({ id, storage }: GetConversationsPayload) => {
  const conversations = JSON.parse(
    (await storage.getItem(ChatStorageKeys.conversations)) ?? '[]'
  ) as Conversation[]

  const updatedConversations = conversations.map((conversation) =>
    conversation.id === id ? { ...conversation, isPinned: false } : conversation
  )

  await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(updatedConversations))

  return { conversations: updatedConversations }
}

export default unpinConversation
