import { useLiveQuery } from 'dexie-react-hooks'
import React, { useEffect, useState, useContext, createContext, useCallback } from 'react'

import { db } from '@/shared/db'
import { BranchPath } from '@/shared/db/models/Branch'
import { useChat } from '@/sidebar/providers/ChatProvider'
import buildMessageTree from '@/sidebar/utils/buildMessageTree'
import findDefaultBranch from '@/sidebar/utils/findDefaultBranch'

interface BranchContextType {
  branchPath: BranchPath
  updateBranchPath: (newBranchPath: BranchPath) => Promise<void>
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export const BranchProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { selectedConversation, messages } = useChat()
  const [branchPath, setBranchPath] = useState<BranchPath>([])

  const branch = useLiveQuery(async () => {
    if (!selectedConversation) return

    return (await db.branches.where({ conversationId: selectedConversation.id }).first()) ?? null
  }, [selectedConversation])

  const updateBranchPath = useCallback(
    async (newBranchPath: BranchPath) => {
      setBranchPath(newBranchPath)

      if (!branch) return

      await db.branches.where({ id: branch?.id }).modify({
        branchPath: newBranchPath
      })
    },
    [branch]
  )

  useEffect(() => {
    const loadBranchPath = async () => {
      if (!selectedConversation || !messages || branch === undefined) return

      if (branch && branch.branchPath.length > 0) {
        setBranchPath(branch.branchPath)
        return
      }

      const messageTree = buildMessageTree(messages)
      const defaultBranch = findDefaultBranch(messageTree)
      setBranchPath(defaultBranch)

      await db.branches.add({
        conversationId: selectedConversation.id!,
        branchPath: defaultBranch
      })
    }

    loadBranchPath()
  }, [selectedConversation, messages, branch])

  return (
    <BranchContext.Provider value={{ branchPath, updateBranchPath }}>
      {children}
    </BranchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBranch = () => {
  const context = useContext(BranchContext)
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider')
  }
  return context
}
