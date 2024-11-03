import i18next from 'i18next'

import { GroqState } from '@/sidebar/types/Groq'

export const ERROR_MESSAGES = {
  'Network Error': () => i18next.t('settings.integrations.groq.disconnected'),
  invalidApiKey: () => i18next.t('settings.integrations.groq.invalidApiKey')
} as const

export const INITIAL_STATE: GroqState = {
  apiKey: '',
  models: [],
  connected: false,
  active: false,
  isLoading: false,
  verifyingConnection: false,
  isInitialized: false
}
