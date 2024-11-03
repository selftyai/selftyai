import { Avatar, AvatarIcon, Image } from '@nextui-org/react'
import i18next from 'i18next'
import React, { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import logo from '@/shared/assets/logo.svg'
import MessageCard from '@/sidebar/components/Chat/Message'
import Markdown from '@/sidebar/components/Chat/Message/Markdown'
import { ConversationWithModel } from '@/sidebar/types/ConversationWithModel'
import { TreeNode } from '@/sidebar/types/TreeNode'
import { parseMessageWithContext } from '@/sidebar/utils/parseMessage'

interface MessageGroupProps extends React.PropsWithChildren {
  node: TreeNode
  attempts: number
  currentAttempt: number
  canContinue: boolean
  canRegenerate: boolean
  isGenerating: boolean
  conversation: ConversationWithModel

  onAttemptChange: (attempt: number) => void
  onMessageCopy: () => void
  onContinueGenerating: () => void
  onRegenerate: () => void
}

const preprocessMarkdown = (markdownText: string) => {
  const processedText = markdownText
    .replace(/\\\[/g, '$')
    .replace(/\\\]/g, '$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')

  return processedText.trim()
}

const errors = {
  NetworkError: i18next.t('errors.NetworkError'),
  AbortedError: i18next.t('errors.AbortedError'),
  default: i18next.t('errors.default')
} as const

const MessageGroup = memo(
  ({
    node,
    children,
    attempts,
    currentAttempt,
    canContinue,
    canRegenerate,
    isGenerating,
    conversation,
    onAttemptChange,
    onMessageCopy,
    onContinueGenerating,
    onRegenerate
  }: MessageGroupProps) => {
    const { t } = useTranslation()
    const parsedContent = parseMessageWithContext(node.content)

    const message =
      node.role === 'assistant' ? (
        preprocessMarkdown(node.content)
      ) : (
        <React.Fragment key={`message-${node.id}`}>
          <Markdown children={parsedContent.message} />
          {node.files.length > 0 && (
            <div className="inline-flex gap-2">
              {node.files.map((file, fileIndex) => (
                <Image
                  key={`image-${node.conversationId}-${node.id}-${fileIndex}`}
                  alt="uploaded image cover"
                  className="size-32 rounded-small border-small border-default-200/50 object-cover"
                  src={file.data}
                />
              ))}
            </div>
          )}
        </React.Fragment>
      )

    return (
      <React.Fragment>
        {isGenerating ? (
          <div className="inline-flex items-center gap-2 text-sm">
            {conversation && (
              <React.Fragment>
                <Avatar
                  size="sm"
                  className="mr-2.5 bg-foreground dark:bg-background"
                  isBordered
                  src={logo}
                />
                <Trans
                  i18nKey={
                    !node.tools.length || node.tools[node.tools.length - 1].status !== 'loading'
                      ? 'generatingResponse'
                      : 'runTool'
                  }
                  values={{
                    model: conversation?.model?.name,
                    ...(node.tools.length && {
                      toolName: t(`tools.${node.tools[node.tools.length - 1].toolName}`, {
                        provider: t(`tools.${node.tools[node.tools.length - 1].subName}`)
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
        ) : (
          <MessageCard
            tools={node.tools}
            avatar={
              node.role === 'user' ? (
                <Avatar
                  isBordered
                  size="sm"
                  icon={<AvatarIcon />}
                  classNames={{
                    base: 'bg-gradient-to-br from-[#FFB457] to-[#FF705B]',
                    icon: 'text-black/80'
                  }}
                />
              ) : (
                <Avatar
                  src={logo}
                  size="sm"
                  radius="full"
                  className="bg-foreground dark:bg-background"
                  isBordered
                />
              )
            }
            attempts={attempts}
            currentAttempt={currentAttempt}
            message={message}
            messageContext={parsedContent.context}
            messageClassName={node.role === 'user' ? 'bg-content3 text-content3-foreground' : ''}
            showFeedback={node.role === 'assistant' && (!!node.promptTokens || !!node.finishReason)}
            status={node.finishReason}
            onAttemptChange={onAttemptChange}
            statusText={errors[node.error as keyof typeof errors] || node.error}
            onMessageCopy={onMessageCopy}
            onContinueGenerating={onContinueGenerating}
            canContinue={canContinue}
            metadata={
              {
                completionTokens: node?.completionTokens?.toString(),
                promptTokens: node?.promptTokens?.toString(),
                totalTokens: node?.totalTokens?.toString()
                // TODO: Add these back when the background is ready
                // waitTime: rest.waitingTime ? `${rest.waitingTime / 1000}` : 0,
                // responseTime: rest.responseTime ? `${rest.responseTime / 1000}` : 0
              } as Record<string, string>
            }
            onRegenerate={onRegenerate}
            canRegenerate={canRegenerate}
            model={conversation.model}
          />
        )}
        {children}
      </React.Fragment>
    )
  }
)

export default MessageGroup
