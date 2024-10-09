export enum ServerEndpoints {
  // Conversations
  createConversation = 'createConversation',
  getConversations = 'getConversations',
  deleteConversation = 'deleteConversation',
  sendMessage = 'sendMessage',
  pinConversation = 'pinConversation',
  unpinConversation = 'unpinConversation',

  // Ollama
  ollamaVerifyConnection = 'ollamaVerifyConnection',
  ollamaModels = 'ollamaModels',
  ollamaPullModel = 'ollamaPullModel',
  ollamaDeleteModel = 'ollamaDeleteModel',
  ollamaChangeUrl = 'ollamaChangeUrl'
}
