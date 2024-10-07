import { Image } from '@nextui-org/react'
import type { CoreMessage } from 'ai'
import { memo } from 'react'

import logo from '@/shared/assets/logo.svg'
import { Message } from '@/shared/types/Message'
import MessageCard from '@/sidebar/components/Chat/Message'

interface ConversationProps {
  messages: Message[]
  error: string
  isGenerating: boolean
}

const Conversation = memo(({ messages, isGenerating, error }: ConversationProps) => {
  const isLastMessage = (arr: CoreMessage[], index: number) => {
    return index === arr.length - 1 && arr[index].role === 'assistant'
  }

  return (
    <div className="flex flex-col gap-4 px-1">
      {messages.map(({ role, content }, index, arr) => {
        console.log(content)
        const message =
          typeof content === 'string'
            ? content
            : [
                ...content
                  .filter((part) => part.type === 'text')
                  .map((part, partIndex) => <div key={partIndex}>{part.text}</div>),
                ...content
                  .filter((part) => part.type === 'image')
                  .map((part, partIndex) => (
                    <div key={partIndex + 10}>
                      <Image
                        alt="uploaded image cover"
                        className="size-32 rounded-small border-small border-default-200/50 object-cover"
                        src={part.image.toString()}
                      />
                    </div>
                  ))
              ]

        const messageLength =
          typeof content === 'string'
            ? content.length
            : content.filter((part) => part.type === 'text').join('').length

        return (
          <MessageCard
            key={index}
            attempts={1}
            avatar={role === 'assistant' ? logo : undefined}
            currentAttempt={1}
            message={message}
            messageClassName={role === 'user' ? 'bg-content3 text-content3-foreground' : ''}
            showFeedback={
              (role === 'assistant' && index !== arr.length - 1) ||
              (role === 'assistant' && index === arr.length - 1 && !isGenerating)
            }
            status={error && isLastMessage(arr, index) && !isGenerating ? 'failed' : undefined}
            statusText={
              error && isLastMessage(arr, index) && !isGenerating ? <>{error}</> : undefined
            }
            isLastMessage={isLastMessage(arr, index) && messageLength > 300 && !error}
            isGenerating={isGenerating && isLastMessage(arr, index) && !messageLength}
          />
        )
      })}
    </div>
  )
})

export default Conversation
