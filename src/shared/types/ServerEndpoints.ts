export enum ServerEndpoints {
  // Conversations
  createConversation = 'createConversation',
  getConversations = 'getConversations',
  deleteConversation = 'deleteConversation',
  sendMessage = 'sendMessage',
  setMessageContext = 'setMessageContext',
  pinConversation = 'pinConversation',
  unpinConversation = 'unpinConversation',
  regenerateResponse = 'regenerateResponse',
  continueGenerating = 'continueGenerating',
  stop = 'stop',

  // Ollama
  ollamaVerifyConnection = 'ollamaVerifyConnection',
  ollamaModels = 'ollamaModels',
  ollamaPullModel = 'ollamaPullModel',
  ollamaDeleteModel = 'ollamaDeleteModel',
  ollamaChangeUrl = 'ollamaChangeUrl',
  disableOllama = 'disableOllama',
  enableOllama = 'enableOllama',
  integrationStatusOllama = 'integrationStatusOllama',

  //SidePanel
  sidePanelHandlerer = 'sidePanelHandlerer'
}
