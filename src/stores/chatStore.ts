import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Conversation } from '@/types/Conversation'
import { createChromeStorage } from '@/utils/storage'

interface ChatState {
  conversations: Conversation[]
  setConversations: (conversations: Conversation[]) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      setConversations: (conversations) => set({ conversations }),
      isGenerating: false,
      setIsGenerating: (isGenerating) => set({ isGenerating })
    }),
    {
      name: 'chat',
      storage: createJSONStorage(() => createChromeStorage('local'))
    }
  )
)
