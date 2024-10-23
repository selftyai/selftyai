export enum ContentScriptServerEndpoints {
  themeChanged = 'themeChanged',
  languageChanged = 'languageChanged',
  setContextIsEnable = 'setContextIsEnable'
}

export interface ContentScriptMessage {
  type: ContentScriptServerEndpoints
  payload: unknown
}
