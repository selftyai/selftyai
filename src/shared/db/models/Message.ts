import { TimestampedEntity } from '@/shared/db/models'

export interface Message extends TimestampedEntity {
  id?: number
  content: string
  role: 'user' | 'assistant'
  modelId: number
  conversationId: number
  parentMessageId?: number
  waitingTime?: number
  responseTime?: number
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  finishReason?: string
  error?: string
  availableTools?: string[]
}
