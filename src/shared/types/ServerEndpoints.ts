export enum ServerEndpoints {
  // Conversations
  createConversation = 'createConversation',
  sendMessage = 'sendMessage',
  setMessageContext = 'setMessageContext',
  regenerateResponse = 'regenerateResponse',
  continueGenerating = 'continueGenerating',
  stop = 'stop',

  // Ollama
  ollamaVerifyConnection = 'ollamaVerifyConnection',
  ollamaModels = 'ollamaModels',
  ollamaPullModel = 'ollamaPullModel',
  ollamaDeleteModel = 'ollamaDeleteModel',

  // Groq
  groqVerifyConnection = 'groqVerifyConnection',

  //SidePanel
  sidePanelHandler = 'sidePanelHandler',

  // Internalization
  getCurrentLanguage = 'getCurrentLanguage',

  // Theme
  getTheme = 'getTheme',
  setTheme = 'setTheme'
}
