import { CoreMessage, generateText } from 'ai'

import getProvider from '@/server/core/chat/getProvider'
import { Conversation } from '@/shared/types/Conversation'

const generateTitle = async (conversation: Conversation): Promise<string> => {
  const provider = getProvider(conversation.provider)

  const prompt = `
    Given the user's prompt, generate a concise and engaging chat title that captures the main idea. The title should:
    - Be less than 50 characters (including spaces and emojis)
    - Include relevant emojis to enhance meaning (optional but encouraged)
    - Be clear and appropriate
    User's Prompt:
  `.trim()

  const message = {
    ...conversation.messages[0],
    content:
      typeof conversation.messages[0].content === 'string'
        ? `${prompt} ${conversation.messages[0].content}`
        : `${prompt} ${conversation.messages[0].content
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join(' ')}`.trim()
  } as CoreMessage

  const result = await generateText({
    model: provider(conversation.model),
    messages: [message]
  })

  return result.text.length > 50 ? result.text.substring(0, 47) + '...' : result.text
}

export default generateTitle
