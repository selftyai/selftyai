export enum ServerEndpoints {
  // Conversations
  createConversation = 'createConversation',
  sendMessage = 'sendMessage',
  regenerateResponse = 'regenerateResponse',
  continueGenerating = 'continueGenerating',
  stop = 'stop',

  // Ollama
  ollamaVerifyConnection = 'ollamaVerifyConnection',
  ollamaModels = 'ollamaModels',
  ollamaPullModel = 'ollamaPullModel',
  ollamaDeleteModel = 'ollamaDeleteModel',

  // Internalization
  getCurrentLanguage = 'getCurrentLanguage',
  changeLanguage = 'changeLanguage'
}
