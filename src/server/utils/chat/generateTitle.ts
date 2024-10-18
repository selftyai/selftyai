import { CoreMessage, generateText } from 'ai'

import getProvider from '@/server/utils/chat/getProvider'
import { db } from '@/shared/db'

export default async function generateTitle(conversationId: number) {
  const conversation = await db.conversations.where({ id: conversationId }).first()

  if (!conversation) {
    console.warn('[generateTitle] Conversation not found:', conversationId)
    return false
  }

  const model = await db.models.where({ id: conversation.modelId }).first()

  if (!model) {
    console.warn('[generateTitle] Model not found:', conversation.modelId)
    return false
  }

  const provider = await getProvider(model.provider)

  const prompt = `
    Given the user's prompt, generate a concise and engaging chat title that captures the main idea. The title should:
    - Be less than 50 characters (including spaces and emojis)
    - Include relevant emojis to enhance meaning (optional but encouraged)
    - Be clear and appropriate
    Your task is to give only the title of the chat based on the user's prompt. Do not include any other information.
    User's Prompt:
  `.trim()

  const message = await db.messages.where({ conversationId, role: 'user' }).first()

  if (!message) {
    console.warn('[generateTitle] User message not found:', conversationId)
    return false
  }

  const messageData = {
    role: 'user',
    content: `${prompt} ${message.content}`
  } as CoreMessage

  const result = await generateText({
    model: provider(model.model),
    messages: [messageData]
  })

  await db.conversations.update(conversationId, {
    title: result.text.length > 50 ? result.text.substring(0, 47) + '...' : result.text
  })

  return true
}
