import { Transaction } from 'dexie'

import { Conversation } from '@/shared/db/models/Conversation'

export const version = 4
export const stores = {
  models: '++id, name, model, provider, vision, createdAt, updatedAt',
  conversations: '++id, title, modelId, systemMessage, pinned, generating, createdAt, updatedAt',
  messages:
    '++id, content, role, conversationId, modelId, waitingTime, responseTime, promptTokens, completionTokens, totalTokens, finishReason, error, createdAt, updatedAt',
  files: '++id, name, type, data, conversationId, messageId, createdAt, updatedAt',
  integrations: '++id, name, active, apiKey, baseURL, createdAt, updatedAt',
  ollamaPullingModels: '++id, modelTag, status, createdAt, updatedAt'
}

export async function upgrade(transaction: Transaction) {
  const conversationsTable = transaction.table<Conversation>('conversations')

  await conversationsTable.toCollection().modify((conversation) => {
    conversation.generating = false
  })
}
