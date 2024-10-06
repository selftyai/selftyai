import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { Conversation } from '@/shared/types/Conversation'
import { createChromeStorage } from '@/utils/storage'

const getConversations = async () => {
  const storage = createChromeStorage('local')

  const conversations = JSON.parse(
    (await storage.getItem(ChatStorageKeys.conversations)) ?? '[]'
  ) as Conversation[]

  return { conversations }
}

export default getConversations
