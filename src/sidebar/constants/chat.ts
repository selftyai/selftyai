import { ChatState } from '@/sidebar/types/Chat'

export const INITIAL_STATE: ChatState = {
  isInitialized: false,
  isLoading: false,
  models: [],
  selectedModel: undefined,
  conversations: [],
  selectedConversation: undefined,
  messages: [],
  context: undefined,
  tools: []
}

export const defaultPrompts = {
  withContext: 'Context: <context></context>\nMessage: <message></message>',
  withoutContext: '<message></message>'
}
