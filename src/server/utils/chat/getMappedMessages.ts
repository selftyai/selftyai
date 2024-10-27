import { AIMessage, HumanMessage } from '@langchain/core/messages'

import { File } from '@/shared/db/models/File'
import { Message } from '@/shared/db/models/Message'

export default function getMappedMessages(messages: Message[], files: File[]) {
  return messages.map((message) =>
    message.role === 'assistant'
      ? new AIMessage(message.content)
      : new HumanMessage({
          content:
            files.filter((file) => file.messageId === message.id).length > 0
              ? [
                  {
                    text: message.content,
                    type: 'text'
                  },
                  ...files
                    .filter((file) => file.messageId === message.id && file.type === 'image')
                    .map((file) => ({
                      type: 'image_url',
                      image_url: {
                        url: file.data
                      }
                    }))
                ]
              : message.content
        })
  )
}
