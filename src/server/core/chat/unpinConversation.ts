import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { Conversation } from '@/shared/types/Conversation'

interface GetConversationsPayload {
  storage: StateStorage
  id: string
}

const pinConversation = async ({ id, storage }: GetConversationsPayload) => {
  const conversations = JSON.parse(
    (await storage.getItem(ChatStorageKeys.conversations)) ?? '[]'
  ) as Conversation[]

  const conversation = conversations.find((conversation) => conversation.id === id)

  if (conversation) {
    conversation.isPinned = false
    await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(conversations))
  }

  return { conversations }
}

export default pinConversation
