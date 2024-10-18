import { Transaction } from 'dexie'

import { Integration } from '@/shared/db/models/Integration'

export const version = 2
export const stores = {
  models: '++id, name, model, provider, vision, createdAt, updatedAt',
  conversations: '++id, title, modelId, systemMessage, pinned, createdAt, updatedAt',
  messages:
    '++id, content, role, conversationId, modelId, waitingTime, responseTime, promptTokens, completionTokens, totalTokens, finishReason, error, createdAt, updatedAt',
  files: '++id, name, type, data, conversationId, messageId, createdAt, updatedAt',
  integrations: '++id, name, active, apiKey, baseURL, createdAt, updatedAt'
}

export async function upgrade(transaction: Transaction) {
  const integrationsTable = transaction.table<Integration>('integrations')
  const count = await integrationsTable.count()

  if (count === 0) {
    const integrations: Integration[] = [
      {
        name: 'ollama',
        active: false,
        baseURL: 'http://localhost:11434'
      },
      {
        name: 'groq',
        active: false,
        baseURL: 'https://api.groq.com/openai/v1'
      },
      {
        name: 'lmStudio',
        active: false,
        baseURL: 'http://localhost:1234/v1'
      },
      {
        name: 'aimlapi',
        active: false,
        baseURL: 'https://api.aimlapi.com/v1'
      }
    ]

    await integrationsTable.bulkAdd(integrations)
  }
}
