import getConversations from '@/server/core/chat/getConversations'
import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'

interface DeleteConversationPayload {
  id: string
  storage: StateStorage
}

const deleteConversation = async ({ id, storage }: DeleteConversationPayload) => {
  const { conversations } = await getConversations({ storage })

  const index = conversations.findIndex((c) => c.id === id)

  conversations.splice(index, 1)

  await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(conversations))

  return {
    conversations,
    payload: { id }
  }
}

export default deleteConversation
