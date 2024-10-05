export enum ServerEndpoints {
  // Conversations
  createConversation = 'createConversation',
  getConversations = 'getConversations',
  deleteConversation = 'deleteConversation',
  sendMessage = 'sendMessage',

  // Ollama
  ollamaVerifyConnection = 'ollamaVerifyConnection',
  ollamaModels = 'ollamaModels',
  ollamaPullModel = 'ollamaPullModel',
  ollamaDeleteModel = 'ollamaDeleteModel',
  ollamaChangeUrl = 'ollamaChangeUrl'
}
