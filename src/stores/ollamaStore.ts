import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Model } from '@/types/Model'
import { createChromeStorage } from '@/utils/storage'

interface OllamaState {
  models: Model[]
  setModels: (models: Model[]) => void
  connected: boolean
  setConnected: (connected: boolean) => void
}

export const useOllamaStore = create<OllamaState>()(
  persist(
    (set) => ({
      models: [],
      setModels: (models) => set({ models }),
      connected: false,
      setConnected: (connected) => set({ connected })
    }),
    {
      name: 'ollama',
      storage: createJSONStorage(() => createChromeStorage('local'))
    }
  )
)
