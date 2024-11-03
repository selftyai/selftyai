import { db } from '@/shared/db'

export default async function deleteConversation(conversationId: number) {
  const messageIds = await db.messages.where({ conversationId }).primaryKeys()

  await db.toolInvocations.where('messageId').anyOf(messageIds).delete()
  await db.branches.where({ conversationId }).delete()
  await db.files.where({ conversationId }).delete()
  await db.messages.where({ conversationId }).delete()
  await db.conversations.delete(conversationId)
}
