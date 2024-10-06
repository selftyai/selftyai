import getConversations from '@/server/core/chat/getConversations'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { createChromeStorage } from '@/utils/storage'

interface DeleteConversationPayload {
  id: string
}

const deleteConversation = async ({ id }: DeleteConversationPayload) => {
  const storage = createChromeStorage('local')

  const { conversations } = await getConversations()

  const index = conversations.findIndex((c) => c.id === id)

  conversations.splice(index, 1)

  await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(conversations))

  return {
    conversations,
    payload: { id }
  }
}

export default deleteConversation
