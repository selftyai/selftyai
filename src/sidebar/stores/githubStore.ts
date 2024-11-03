import { create } from 'zustand'

import logger from '@/shared/logger'
import { Integrations } from '@/shared/types/Integrations'
import { INITIAL_STATE } from '@/sidebar/constants/github'
import { GithubActions, GithubState } from '@/sidebar/types/Github'
import getIntegration from '@/sidebar/utils/ai/getIntegration'

export const useGithubStore = create<GithubState & GithubActions>((set, get) => {
  const initializeIntegration = async () => {
    try {
      set({ isLoading: true })
      const { integration, models } = await getIntegration(Integrations.githubModels)
      const { apiKey, active } = integration

      set({
        models,
        apiKey,
        active,
        integration,
        isInitialized: true,
        isLoading: false
      })
    } catch (error) {
      logger.error('Failed to load Github integration', error)
      set({ ...INITIAL_STATE, isInitialized: true })
    }
  }

  initializeIntegration()

  return {
    ...INITIAL_STATE,
    setActive: () => set({ active: !get().active }),
    setApiKey: (apiKey: string) => set({ apiKey })
  }
})
