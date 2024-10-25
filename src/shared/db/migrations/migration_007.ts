export const version = 7
export const stores = {
  models: '++id, name, model, provider, vision, supportTool, createdAt, updatedAt',
  conversations: '++id, title, modelId, systemMessage, pinned, generating, createdAt, updatedAt',
  messages:
    '++id, content, role, conversationId, modelId, waitingTime, responseTime, promptTokens, completionTokens, totalTokens, finishReason, error, createdAt, updatedAt',
  files: '++id, name, type, data, conversationId, messageId, createdAt, updatedAt',
  integrations: '++id, name, active, apiKey, baseURL, createdAt, updatedAt',
  ollamaPullingModels: '++id, modelTag, status, createdAt, updatedAt',
  settings: 'key, value',
  toolInvocations:
    '++id, messageId, toolName, subName, runId, input, output, status, error, createdAt, updatedAt'
}
export async function upgrade() {}
