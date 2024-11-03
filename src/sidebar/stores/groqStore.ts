import { create } from 'zustand'

import logger from '@/shared/logger'
import { Integrations } from '@/shared/types/Integrations'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { INITIAL_STATE } from '@/sidebar/constants/groq'
import { useChromeStore } from '@/sidebar/services/ChromePortManager'
import { GroqState, GroqActions } from '@/sidebar/types/Groq'
import getIntegration from '@/sidebar/utils/ai/getIntegration'
import { handleConnectionResult } from '@/sidebar/utils/groq/groqConnection'

export const useGroqStore = create<GroqState & GroqActions>((set, get) => {
  const initializeIntegration = async () => {
    try {
      set({ isLoading: true })
      const { integration, models } = await getIntegration(Integrations.groq)
      const { apiKey, active } = integration

      const unsubscribe = useChromeStore.subscribe((state) => {
        const { lastMessage } = state
        if (lastMessage?.type === ServerEndpoints.groqVerifyConnection) {
          const { connected, error } = lastMessage.response
          const { verifyingConnection } = get()

          set({ verifyingConnection: false, connected })
          handleConnectionResult(connected, error, verifyingConnection)
        }
      })

      const { sendMessage } = useChromeStore.getState()
      sendMessage(ServerEndpoints.groqVerifyConnection, { url: apiKey })

      set({
        models,
        apiKey,
        active,
        integration,
        isInitialized: true,
        isLoading: false
      })

      return unsubscribe
    } catch (error) {
      logger.error('Error loading Groq integration', error)
      set({ isLoading: false })
    }
  }

  initializeIntegration()

  return {
    ...INITIAL_STATE,
    verifyConnection: async (apiKey: string) => {
      set({ verifyingConnection: true })
      useChromeStore.getState().sendMessage(ServerEndpoints.groqVerifyConnection, { url: apiKey })
    },
    setActive: () => set({ active: !get().active }),
    setApiKey: (apiKey: string) => set({ apiKey })
  }
})
