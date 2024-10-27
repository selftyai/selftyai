export enum ContentScriptServerEndpoints {
  themeChanged = 'themeChanged',
  languageChanged = 'languageChanged',
  setPageOverlayIsEnable = 'setPageOverlayIsEnable',
  setIsContextInPromptEnabled = 'setIsContextInPromptEnabled'
}

export interface ContentScriptMessage {
  type: ContentScriptServerEndpoints
  payload: unknown
}
