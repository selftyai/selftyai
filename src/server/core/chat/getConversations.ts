import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { Conversation } from '@/shared/types/Conversation'

interface GetConversationsPayload {
  storage: StateStorage
}

const getConversations = async ({ storage }: GetConversationsPayload) => {
  const conversations = JSON.parse(
    (await storage.getItem(ChatStorageKeys.conversations)) ?? '[]'
  ) as Conversation[]

  return { conversations }
}

export default getConversations
