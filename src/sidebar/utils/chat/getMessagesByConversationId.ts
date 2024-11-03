import { db } from '@/shared/db'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'

export default async function getMessagesByConversationId(conversationId: number) {
  const messages = await db.messages.where({ conversationId: Number(conversationId) }).toArray()
  const files = await db.files.where({ conversationId: Number(conversationId) }).toArray()
  const tools = await db.toolInvocations.toArray()

  const messagesWithFiles: MessageWithFiles[] = messages.map((message) => {
    return {
      ...message,
      files: files.filter((file) => file.messageId === message.id),
      tools: tools.filter((tool) => tool.messageId === message.id)
    }
  })

  return messagesWithFiles
}
