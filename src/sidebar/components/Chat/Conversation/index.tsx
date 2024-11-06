import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import MessageGroup from '@/sidebar/components/Chat/MessageGroup'
import { useBranch } from '@/sidebar/providers/BranchProvider'
import { useChat, useModels } from '@/sidebar/providers/ChatProvider'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'
import { TreeNode } from '@/sidebar/types/TreeNode'
import buildMessageTree from '@/sidebar/utils/buildMessageTree'
import selectBranch from '@/sidebar/utils/selectBranch'

interface ConversationProps {
  messages?: MessageWithFiles[]
  isGenerating: boolean
}

const Conversation = memo(
  React.forwardRef<HTMLDivElement, ConversationProps>(({ messages, isGenerating }, ref) => {
    const { t } = useTranslation()
    const { selectedModel } = useModels()
    const { selectedConversation, continueGenerating, regenerateResponse, sendMessage } = useChat()
    const { branchPath, updateBranchPath } = useBranch()

    const messageTree = useMemo(() => buildMessageTree(messages || []), [messages])

    const handleMessageCopy = useCallback(() => {
      toast.success(t('copied'), {
        duration: 2000,
        position: 'top-center'
      })
    }, [t])

    function renderMessages(
      nodes: TreeNode[],
      path: number[] = [],
      parent: TreeNode | null = null
    ): React.ReactNode {
      return nodes.map((node) => {
        if (!branchPath.includes(node.id!)) return null

        const newPath = [...path, node.id!]

        const parentNode = parent || { children: nodes }

        return (
          <MessageGroup
            key={node.id}
            node={node}
            attempts={parentNode.children.length || 1}
            currentAttempt={
              parentNode.children.findIndex(
                (child) => child.id === branchPath[newPath.length - 1]
              ) + 1 || 1
            }
            isGenerating={
              isGenerating &&
              node.id === branchPath[newPath.length - 1] &&
              !node.content.length &&
              !node.tools.length
            }
            conversation={selectedConversation!}
            canContinue={!!selectedModel}
            canRegenerate={!!selectedModel}
            onAttemptChange={(attempt) => {
              updateBranchPath(
                selectBranch(messageTree, [
                  ...newPath.slice(0, -1),
                  parentNode.children[attempt - 1].id!
                ])
              )
            }}
            onMessageCopy={handleMessageCopy}
            onContinueGenerating={() => continueGenerating(node.id!)}
            onRegenerate={() => parent && regenerateResponse(parent.id!)}
            onEdit={(newMessage) => sendMessage(newMessage, node.files, parent?.id || null)}
            isLastMessage={newPath.length === branchPath.length}
          >
            {node?.children.length > 0 &&
              renderMessages(
                node.children.filter(
                  (child) => node.children.length === 1 || branchPath.includes(child.id!)
                ),
                newPath,
                node
              )}
          </MessageGroup>
        )
      })
    }

    return (
      <div ref={ref} className="flex flex-col gap-4 px-2">
        {renderMessages(messageTree)}
      </div>
    )
  })
)

export default Conversation
