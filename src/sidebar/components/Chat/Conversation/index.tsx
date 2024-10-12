import { Avatar, AvatarIcon, Image } from '@nextui-org/react'
import type { CoreMessage } from 'ai'
import React, { memo } from 'react'
import { toast } from 'sonner'

import logo from '@/shared/assets/logo.svg'
import { Message } from '@/shared/types/Message'
import MessageCard from '@/sidebar/components/Chat/Message'
import { useChat, useModels } from '@/sidebar/providers/ChatProvider'

interface ConversationProps {
  messages: Message[]
  isGenerating: boolean
}

const Conversation = memo(
  React.forwardRef<HTMLDivElement, ConversationProps>(({ messages, isGenerating }, ref) => {
    const { selectedModel } = useModels()
    const { conversations, chatId, continueGenerating, regenerateResponse } = useChat()

    const conversation = conversations.find((conversation) => conversation.id === chatId)

    const isLastMessage = (arr: CoreMessage[], index: number) => {
      return index === arr.length - 1 && arr[index].role === 'assistant'
    }

    const errors = {
      NetworkError: 'A network error occurred. Please check your connection and try again.',
      AbortedError:
        'The request was aborted. If you want to continue, click on the continue button or write a new message.',
      default: 'An error occurred. Please try again.'
    }
    console.log(messages)
    return (
      <div ref={ref} className="flex flex-col gap-4 px-2">
        {messages.map(
          ({ role, content, userMessage, context, error, finishReason, ...rest }, index, arr) => {
            const message =
              role === 'user'
                ? userMessage
                : typeof content === 'string'
                  ? content
                  : content.map(
                      (part: { type: string; text?: string; image?: string }, partIndex) => {
                        if (part.type === 'text' && part.text) {
                          return <div key={`text-${partIndex}`}>{part.text}</div>
                        } else if (part.type === 'image' && part.image) {
                          return (
                            <div key={`image-${partIndex}`}>
                              <Image
                                alt="uploaded image cover"
                                className="size-32 rounded-small border-small border-default-200/50 object-cover"
                                src={part.image.toString()}
                              />
                            </div>
                          )
                        } else {
                          return null
                        }
                      }
                    )

            // const message =
            //   typeof content === 'string'
            //     ? content
            //     : content.map((part, partIndex) =>
            //         part.type === 'text' ? (
            //           <div key={`text-${partIndex}`}>{part.text}</div>
            //         ) : part.type === 'image' ? (
            //           <div key={`image-${partIndex}`}>
            //             <Image
            //               alt="uploaded image cover"
            //               className="size-32 rounded-small border-small border-default-200/50 object-cover"
            //               src={part.image.toString()}
            //             />
            //           </div>
            //         ) : null
            //       )
            console.log(message)

            if (isGenerating && isLastMessage(messages, index) && !content.length) {
              return (
                <div className="inline-flex items-center gap-2 text-sm">
                  {selectedModel && (
                    <React.Fragment>
                      <Avatar
                        size="sm"
                        className="mr-2.5 bg-foreground dark:bg-background"
                        isBordered
                        src={logo}
                      />
                      {conversation?.model} is thinking
                      <div className="mt-4 flex">
                        <span className="circle animate-loader"></span>
                        <span className="circle animation-delay-200 animate-loader"></span>
                        <span className="circle animation-delay-400 animate-loader"></span>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              )
            }

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
                messageContext={context}
                messageClassName={role === 'user' ? 'bg-content3 text-content3-foreground' : ''}
                showFeedback={
                  (role === 'assistant' && index !== arr.length - 1) ||
                  (role === 'assistant' && index === arr.length - 1 && !isGenerating)
                }
                status={finishReason}
                statusText={
                  error ? <>{errors[error as keyof typeof errors] || errors.default}</> : undefined
                }
                onMessageCopy={() =>
                  toast.success('Message copied!', {
                    duration: 2000,
                    position: 'top-center'
                  })
                }
                onContinueGenerating={continueGenerating}
                canContinue={!!selectedModel}
                metadata={
                  {
                    completionTokens: rest.usage?.completionTokens.toString(),
                    promptTokens: rest.usage?.promptTokens.toString(),
                    totalTokens: rest.usage?.totalTokens.toString(),
                    waitTime: rest.waitingTime ? `${rest.waitingTime / 1000}s` : 'n/a',
                    responseTime: rest.responseTime ? `${rest.responseTime / 1000}s` : 'n/a'
                  } as Record<string, string>
                }
                onRegenerate={regenerateResponse}
                canRegenerate={!!selectedModel}
                isLastMessage={isLastMessage(arr, index)}
              />
            )
          }
        )}
        {isGenerating && !isLastMessage(messages, messages.length - 1) && (
          <div className="inline-flex items-center gap-2 text-sm">
            {selectedModel && (
              <React.Fragment>
                <Avatar
                  size="sm"
                  className="mr-2.5 bg-foreground dark:bg-background"
                  isBordered
                  src={logo}
                />
                {conversation?.model} is thinking
                <div className="mt-4 flex">
                  <span className="circle animate-loader"></span>
                  <span className="circle animation-delay-200 animate-loader"></span>
                  <span className="circle animation-delay-400 animate-loader"></span>
                </div>
              </React.Fragment>
            )}
          </div>
        )}
      </div>
    )
  })
)

export default Conversation
