import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { Conversation } from '@/shared/types/Conversation'

const createConversation = async (
  conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'messages'>,
  storage: StateStorage
) => {
  const conversations = JSON.parse(
    (await storage.getItem(ChatStorageKeys.conversations)) ?? '[]'
  ) as Conversation[]

  const newConversation = {
    ...conversation,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: []
  }
  conversations.push(newConversation)

  await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(conversations))

  return newConversation
}

export default createConversation
