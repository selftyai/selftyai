import { CoreMessage } from 'ai'

import { Provider } from '@/services/types/Provider'

export type Message = CoreMessage & {
  id: string
  createdAt: Date
  updatedAt: Date
}

export type Conversation = {
  id: string
  title: string
  model: string
  provider: Provider
  messages: Message[]
  systemMessage: string
  createdAt: Date
  updatedAt: Date
}
