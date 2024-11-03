import { Integration } from '@/shared/db/models/Integration'
import { Model } from '@/shared/db/models/Model'

export type GroqConnectionError = 'Network Error' | 'invalidApiKey'

export interface GroqState {
  isLoading: boolean
  integration?: Integration
  apiKey: string
  models: Model[]
  connected: boolean
  active: boolean
  verifyingConnection: boolean
  isInitialized: boolean
}

export interface GroqActions {
  verifyConnection: (url: string) => Promise<void>
  setActive: () => void
  setApiKey: (apiKey: string) => void
}
