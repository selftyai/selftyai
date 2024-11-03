import React, { useContext, createContext, useCallback, useState, useEffect } from 'react'

import { db } from '@/shared/db'
import { BranchPath } from '@/shared/db/models/Branch'
import { useChat } from '@/sidebar/providers/ChatProvider'
import buildMessageTree from '@/sidebar/utils/buildMessageTree'
import findDefaultBranch from '@/sidebar/utils/findDefaultBranch'

interface BranchContextType {
  branchPath: BranchPath
  updateBranchPath: (newBranchPath: BranchPath) => Promise<void>
  isLoading: boolean
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export const BranchProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { selectedConversation, messages } = useChat()
  const [branchPath, setBranchPath] = useState<BranchPath>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getDefaultBranchPath() {
      const messageTree = buildMessageTree(messages)
      return findDefaultBranch(messageTree)
    }

    async function loadBranchPath() {
      if (!selectedConversation || !messages) {
        setBranchPath([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const branch = await db.branches.where({ conversationId: selectedConversation.id }).first()

      if (!branch) {
        const defaultBranch = await getDefaultBranchPath()
        await db.branches.add({
          conversationId: selectedConversation.id!,
          branchPath: defaultBranch
        })
        setBranchPath(defaultBranch)
        setIsLoading(false)
        return
      }

      if (!branch.branchPath.length) {
        const defaultBranch = await getDefaultBranchPath()
        await db.branches.where({ id: branch.id }).modify({
          branchPath: defaultBranch
        })
        setBranchPath(defaultBranch)
        setIsLoading(false)
        return
      }

      setBranchPath(branch.branchPath)
      setIsLoading(false)
    }

    loadBranchPath()
  }, [selectedConversation, messages])

  const updateBranchPath = useCallback(
    async (newBranchPath: BranchPath) => {
      if (!selectedConversation) return

      const branch = await db.branches.where({ conversationId: selectedConversation?.id }).first()

      await db.branches.where({ id: branch?.id }).modify({
        branchPath: newBranchPath
      })
      setBranchPath(newBranchPath)
    },
    [selectedConversation]
  )

  return (
    <BranchContext.Provider value={{ branchPath, updateBranchPath, isLoading }}>
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
