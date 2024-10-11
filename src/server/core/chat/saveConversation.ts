import getConversations from '@/server/core/chat/getConversations'
import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import type { Conversation } from '@/shared/types/Conversation'

const saveConversation = async (conversation: Conversation, storage: StateStorage) => {
  const { conversations } = await getConversations({ storage })

  const index = conversations.findIndex((conv) => conv.id === conversation.id)

  if (index === -1) {
    conversations.push(conversation)
  } else {
    conversations[index] = conversation
  }

  await storage.setItem(ChatStorageKeys.conversations, JSON.stringify(conversations))
}

export default saveConversation
