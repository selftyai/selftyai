import { db } from '@/shared/db'
import { Message } from '@/shared/db/models/Message'

export default async function collectMessagesForBranch(leafMessage: Message): Promise<Message[]> {
  const messages: Message[] = []
  let currentMessage: Message | undefined = leafMessage

  while (currentMessage) {
    messages.unshift(currentMessage)
    if (!currentMessage.parentMessageId) break
    currentMessage = await db.messages.get(currentMessage.parentMessageId)
  }

  return messages
}
