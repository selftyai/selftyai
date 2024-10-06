import { AIProvider } from '@/shared/types/AIProvider'
import type { Message } from '@/shared/types/Message'

export type Conversation = {
  id: string
  title: string
  model: string
  provider: AIProvider
  messages: Message[]
  systemMessage: string
  createdAt: Date
  updatedAt: Date
}
