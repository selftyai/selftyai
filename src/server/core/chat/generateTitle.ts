import { generateText } from 'ai'

import getProvider from '@/server/core/chat/getProvider'
import { Conversation } from '@/shared/types/Conversation'

const generateTitle = async (conversation: Conversation): Promise<string> => {
  const provider = getProvider(conversation.provider)

  const result = await generateText({
    model: provider(conversation.model),
    system: `
			You are an AI assistant specialized in creating concise, engaging, and relevant titles for conversations. 
			Your task is to generate a single title that captures the essence of a conversation, making it appealing and interesting to readers. 
			Feel free to incorporate emojis to enhance the title, ensuring they are appropriate and add value.
		`.trim(),
    messages: [conversation.messages[0]]
  })

  return result.text
}

export default generateTitle
