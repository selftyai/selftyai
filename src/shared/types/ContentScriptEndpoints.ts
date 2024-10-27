export enum ContentScriptServerEndpoints {
  themeChanged = 'themeChanged',
  languageChanged = 'languageChanged',
  setPageOverlayIsEnable = 'setPageOverlayIsEnable',
  setIsContextInPromptEnabled = 'setIsContextInPromptEnabled'
}

export interface ContentScriptMessage<T = unknown> {
  type: ContentScriptServerEndpoints
  payload: T
}
