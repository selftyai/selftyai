import { Avatar, AvatarIcon, Image } from '@nextui-org/react'
import React, { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import logo from '@/shared/assets/logo.svg'
import { Message } from '@/shared/db/models/Message'
import MessageCard from '@/sidebar/components/Chat/Message'
import { useChat, useModels } from '@/sidebar/providers/ChatProvider'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'
import { parseMessageWithContext } from '@/sidebar/utils/parseMessage'

interface ConversationProps {
  messages?: MessageWithFiles[]
  isGenerating: boolean
}

const Conversation = memo(
  React.forwardRef<HTMLDivElement, ConversationProps>(({ messages, isGenerating }, ref) => {
    const { t } = useTranslation()
    const { selectedModel } = useModels()
    const { selectedConversation, continueGenerating, regenerateResponse } = useChat()

    const isLastMessage = (arr: Message[], index: number) => {
      return index === arr.length - 1 && arr[index].role === 'assistant'
    }

    const errors = {
      NetworkError: t('errors.NetworkError'),
      AbortedError: t('errors.AbortedError'),
      default: t('errors.default')
    }

    return (
      <div ref={ref} className="flex flex-col gap-4 px-2">
        {messages?.map(
          (
            { id, role, files, tools, content, conversationId, error, finishReason, ...rest },
            index,
            arr
          ) => {
            const parsedContent = parseMessageWithContext(content)

            const message =
              role === 'assistant' ? (
                content
              ) : (
                <React.Fragment key={`message-${id}`}>
                  <div>{parsedContent.message}</div>
                  {files.length > 0 && (
                    <div className="inline-flex gap-2">
                      {files.map((file, fileIndex) => (
                        <Image
                          key={`image-${conversationId}-${id}-${fileIndex}`}
                          alt="uploaded image cover"
                          className="size-32 rounded-small border-small border-default-200/50 object-cover"
                          src={file.data}
                        />
                      ))}
                    </div>
                  )}
                </React.Fragment>
              )

            if (isGenerating && isLastMessage(messages, index) && !content.length) {
              return (
                <div
                  key={`message-${conversationId}-${id}-${index}`}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  {selectedConversation && (
                    <React.Fragment>
                      <Avatar
                        size="sm"
                        className="mr-2.5 bg-foreground dark:bg-background"
                        isBordered
                        src={logo}
                      />
                      <Trans
                        i18nKey={
                          !tools.length || tools[tools.length - 1].status !== 'loading'
                            ? 'generatingResponse'
                            : 'runTool'
                        }
                        values={{
                          model: selectedConversation?.model?.model,
                          ...(tools.length && {
                            toolName: t(`tools.${tools[tools.length - 1].toolName}`, {
                              provider: t(`tools.${tools[tools.length - 1].subName}`)
                            })
                          })
                        }}
                        components={{
                          Loader: (
                            <div className="mt-4 flex">
                              <span className="circle animate-loader"></span>
                              <span className="circle animation-delay-200 animate-loader"></span>
                              <span className="circle animation-delay-400 animate-loader"></span>
                            </div>
                          )
                        }}
                      />
                    </React.Fragment>
                  )}
                </div>
              )
            }

            return (
              <MessageCard
                key={`message-${conversationId}-${id}-${index}`}
                attempts={1}
                tools={tools}
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
                messageContext={parsedContent.context}
                messageClassName={role === 'user' ? 'bg-content3 text-content3-foreground' : ''}
                showFeedback={
                  (role === 'assistant' && index !== arr.length - 1) ||
                  (role === 'assistant' && index === arr.length - 1 && !isGenerating)
                }
                status={finishReason}
                statusText={
                  error ? <>{errors[error as keyof typeof errors] || error}</> : undefined
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
                    completionTokens: rest?.completionTokens?.toString(),
                    promptTokens: rest?.promptTokens?.toString(),
                    totalTokens: rest?.totalTokens?.toString()
                    // TODO: Add these back when the background is ready
                    // waitTime: rest.waitingTime ? `${rest.waitingTime / 1000}` : 0,
                    // responseTime: rest.responseTime ? `${rest.responseTime / 1000}` : 0
                  } as Record<string, string>
                }
                onRegenerate={regenerateResponse}
                canRegenerate={!!selectedModel}
                isLastMessage={isLastMessage(arr, index)}
              />
            )
          }
        )}
      </div>
    )
  })
)

export default Conversation
