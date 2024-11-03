import { Integration } from '@/shared/db/models/Integration'
import { Model } from '@/shared/db/models/Model'

export interface GithubState {
  isLoading: boolean
  integration?: Integration
  apiKey: string
  models: Model[]
  active: boolean
  isInitialized: boolean
  connected: boolean
  verifyingConnection: boolean
}

export interface GithubActions {
  setActive: () => void
}
