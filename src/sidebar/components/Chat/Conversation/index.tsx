import { Avatar, AvatarIcon, Image } from '@nextui-org/react'
import React, { memo, useCallback, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import logo from '@/shared/assets/logo.svg'
import MessageCard from '@/sidebar/components/Chat/Message'
import { useBranch } from '@/sidebar/providers/BranchProvider'
import { useChat, useModels } from '@/sidebar/providers/ChatProvider'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'
import { TreeNode } from '@/sidebar/types/TreeNode'
import buildMessageTree from '@/sidebar/utils/buildMessageTree'
import { parseMessageWithContext } from '@/sidebar/utils/parseMessage'
import selectBranch from '@/sidebar/utils/selectBranch'

interface ConversationProps {
  messages?: MessageWithFiles[]
  isGenerating: boolean
}

const Conversation = memo(
  React.forwardRef<HTMLDivElement, ConversationProps>(({ messages, isGenerating }, ref) => {
    const { t } = useTranslation()
    const { selectedModel } = useModels()
    const { selectedConversation, continueGenerating, regenerateResponse } = useChat()
    const { branchPath, updateBranchPath } = useBranch()

    const messageTree = useMemo(() => buildMessageTree(messages || []), [messages])

    const handleMessageCopy = useCallback(() => {
      toast.success('Message copied!', {
        duration: 2000,
        position: 'top-center'
      })
    }, [])

    function renderMessages(
      nodes: TreeNode[],
      path: number[] = [],
      parent: TreeNode | null = null
    ): React.ReactNode {
      return nodes.map((node) => {
        const newPath = [...path, node.id!]

        const parsedContent = parseMessageWithContext(node.content)

        const message =
          node.role === 'assistant' ? (
            node.content
          ) : (
            <React.Fragment key={`message-${node.id}`}>
              <div>{parsedContent.message}</div>
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
          <React.Fragment key={node.id}>
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
              attempts={parent ? parent.children.length : 1}
              currentAttempt={
                parent
                  ? parent.children.findIndex(
                      (child) => child.id === branchPath[newPath.length - 1]
                    ) + 1
                  : 1
              }
              message={message}
              messageContext={parsedContent.context}
              messageClassName={node.role === 'user' ? 'bg-content3 text-content3-foreground' : ''}
              showFeedback={node.role === 'assistant' && !isGenerating}
              status={node.finishReason}
              onAttemptChange={(attempt) => {
                if (!parent) return

                updateBranchPath(
                  selectBranch(messageTree, [
                    ...newPath.slice(0, -1),
                    parent.children[attempt - 1].id!
                  ])
                )
              }}
              statusText={errors[node.error as keyof typeof errors] || node.error}
              onMessageCopy={handleMessageCopy}
              onContinueGenerating={() => continueGenerating(node.id!)}
              canContinue={!!selectedModel}
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
              onRegenerate={() => parent && regenerateResponse(parent.id!)}
              canRegenerate={!!selectedModel}
            />

            {node?.children.length > 0 &&
              renderMessages(
                node.children.filter(
                  (child) => node.children.length === 1 || branchPath.includes(child.id!)
                ),
                newPath,
                node
              )}

            {isGenerating &&
              node.id === branchPath[newPath.length - 1] &&
              !node.content.length &&
              !node.tools.length && (
                <div className="inline-flex items-center gap-2 text-sm">
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
                          !node.tools.length ||
                          node.tools[node.tools.length - 1].status !== 'loading'
                            ? 'generatingResponse'
                            : 'runTool'
                        }
                        values={{
                          model: selectedConversation?.model?.model,
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
              )}
          </React.Fragment>
        )
      })
    }

    const errors = {
      NetworkError: t('errors.NetworkError'),
      AbortedError: t('errors.AbortedError'),
      default: t('errors.default')
    }

    return (
      <div ref={ref} className="flex flex-col gap-4 px-2">
        {renderMessages(messageTree)}
      </div>
    )
  })
)

export default Conversation
