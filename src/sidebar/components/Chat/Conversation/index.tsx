import { Avatar, AvatarIcon, Image } from '@nextui-org/react'
import type { CoreMessage } from 'ai'
import React, { memo } from 'react'
import { toast } from 'sonner'

import logo from '@/shared/assets/logo.svg'
import { Message } from '@/shared/types/Message'
import MessageCard from '@/sidebar/components/Chat/Message'
import { useModels } from '@/sidebar/providers/ChatProvider'

interface ConversationProps {
  messages: Message[]
  error: string
  isGenerating: boolean
}

const Conversation = memo(
  React.forwardRef<HTMLDivElement, ConversationProps>(({ messages, isGenerating, error }, ref) => {
    const { selectedModel } = useModels()

    const isLastMessage = (arr: CoreMessage[], index: number) => {
      return index === arr.length - 1 && arr[index].role === 'assistant'
    }

    return (
      <div ref={ref} className="flex flex-col gap-4 px-2">
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

          return (
            <MessageCard
              key={index}
              attempts={1}
              avatar={
                role === 'assistant' ? (
                  <Avatar
                    src={logo}
                    size="sm"
                    radius="full"
                    className="bg-foreground dark:bg-background"
                    isBordered
                  />
                ) : (
                  <Avatar
                    isBordered
                    size="sm"
                    icon={<AvatarIcon />}
                    classNames={{
                      base: 'bg-gradient-to-br from-[#FFB457] to-[#FF705B]',
                      icon: 'text-black/80'
                    }}
                  />
                )
              }
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
              onMessageCopy={() =>
                toast.success('Message copied!', {
                  duration: 2000,
                  position: 'top-center'
                })
              }
            />
          )
        })}
        {isGenerating && !isLastMessage(messages, messages.length - 1) && (
          <div className="inline-flex items-center gap-2 text-sm">
            {selectedModel !== 'Select model' && (
              <>
                <Avatar
                  size="sm"
                  className="mr-2.5 bg-foreground dark:bg-background"
                  isBordered
                  src={logo}
                />
                {selectedModel.model} is thinking
                <div className="mt-4 flex">
                  <span className="circle animate-loader"></span>
                  <span className="circle animation-delay-200 animate-loader"></span>
                  <span className="circle animation-delay-400 animate-loader"></span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  })
)

export default Conversation
