import { GithubState } from '@/sidebar/types/Github'

export const INITIAL_STATE: GithubState = {
  isLoading: false,
  integration: undefined,
  apiKey: '',
  models: [],
  active: false,
  isInitialized: false,
  connected: false,
  verifyingConnection: false
}
