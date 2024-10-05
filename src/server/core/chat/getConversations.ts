import { Conversation } from '@/types/Conversation'
import { createChromeStorage } from '@/utils/storage'

const getConversations = async () => {
  const storage = createChromeStorage('local')

  const conversations = JSON.parse(
    (await storage.getItem('chat-conversations')) ?? '[]'
  ) as Conversation[]

  console.log('Conversations:', conversations)

  return { conversations }
}

export default getConversations
