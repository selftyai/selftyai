import { CoreMessage, LanguageModelUsage } from 'ai'

export type Message = CoreMessage & {
  id: string
  createdAt: Date
  updatedAt: Date
  waitingTime?: number
  responseTime?: number
  usage?: LanguageModelUsage
  error?: string
  finishReason?: string
  context?: string
  userMessage?: string
}

export function createMessage(message: Omit<Message, 'createdAt' | 'updatedAt'>): Message {
  const now = new Date()
  return {
    ...message,
    createdAt: now,
    updatedAt: now
  } as Message
}
