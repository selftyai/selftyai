export interface SettingsItem {
  key: string
  value: string
}

export enum SettingsKeys {
  language = 'language',
  theme = 'theme',
  isPageOverlayEnabled = 'isPageOverlayEnabled',
  isContextInPromptEnabled = 'isContextInPromptEnabled',
  customPromptWithContext = 'customPromptWithContext',
  customPromptWithoutContext = 'customPromptWithoutContext'
}
