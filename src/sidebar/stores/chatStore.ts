import { create } from 'zustand'

import logger from '@/shared/logger'
import { INITIAL_STATE } from '@/sidebar/constants/chat'
import { useGithubStore } from '@/sidebar/stores/githubStore'
import { useGroqStore } from '@/sidebar/stores/groqStore'
import { ChatActions, ChatState } from '@/sidebar/types/Chat'
import getConversations from '@/sidebar/utils/chat/getConversations'

export const useChatStore = create<ChatState & ChatActions>((set, get) => {
  useGroqStore.subscribe(() => updateModels())
  useGithubStore.subscribe(() => updateModels())

  const updateModels = async () => {
    const { models: groqModels, active: groqActive } = useGroqStore.getState()
    const { models: githubModels, active: githubActive } = useGithubStore.getState()

    set({
      models: [groqActive && groqModels, githubActive && githubModels]
        .filter((m) => typeof m !== 'boolean')
        .flat(),
      isInitialized: true,
      isLoading: false
    })
  }

  const initialize = async () => {
    try {
      set({ isLoading: true })
      const conversations = await getConversations()

      set({
        conversations,
        isInitialized: true,
        isLoading: false
      })
    } catch (error) {
      logger.error('Failed to load Chat store', error)
      set({ ...INITIAL_STATE, isInitialized: true })
    }
  }

  initialize()

  return {
    ...INITIAL_STATE,
    selectConversation: async (conversation) => {
      if (!conversation) {
        set({ selectedConversation: undefined })
        return
      }

      const model = get().models.find((m) => m.id === conversation.modelId)

      set({
        selectedConversation: {
          ...conversation,
          model
        },
        selectedModel: model
      })
    },
    setTools: (tools) => set({ tools }),
    setContext: (context) => set({ context }),
    setModel: (selectedModel) => set({ selectedModel })
  }
})
