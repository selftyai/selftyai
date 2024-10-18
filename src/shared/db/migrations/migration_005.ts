import { Transaction } from 'dexie'

import { SettingsKeys } from '@/shared/db/models/SettingsItem'

export const version = 5
export const stores = {
  models: '++id, name, model, provider, vision, createdAt, updatedAt',
  conversations: '++id, title, modelId, systemMessage, pinned, generating, createdAt, updatedAt',
  messages:
    '++id, content, role, conversationId, modelId, waitingTime, responseTime, promptTokens, completionTokens, totalTokens, finishReason, error, createdAt, updatedAt',
  files: '++id, name, type, data, conversationId, messageId, createdAt, updatedAt',
  integrations: '++id, name, active, apiKey, baseURL, createdAt, updatedAt',
  ollamaPullingModels: '++id, modelTag, status, createdAt, updatedAt',
  settings: 'key, value'
}

export async function upgrade(transaction: Transaction) {
  const settingsTable = transaction.table('settings')

  await settingsTable.bulkAdd([
    { key: SettingsKeys.language, value: 'en' },
    { key: SettingsKeys.theme, value: 'dark' }
  ])
}
