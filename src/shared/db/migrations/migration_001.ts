export const version = 1
export const stores = {
  models: '++id, name, model, provider, vision, isDeleted, createdAt, updatedAt',
  conversations: '++id, title, modelId, systemMessage, pinned, createdAt, updatedAt',
  messages:
    '++id, content, role, conversationId, modelId, waitingTime, responseTime, promptTokens, completionTokens, totalTokens, finishReason, error, createdAt, updatedAt',
  files: '++id, name, type, data, conversationId, messageId, createdAt, updatedAt'
}

export async function upgrade() {}
