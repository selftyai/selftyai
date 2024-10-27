export interface SettingsItem {
  key: string
  value: string
}

export enum SettingsKeys {
  language = 'language',
  theme = 'theme',
  isPageOverlayEnable = 'isPageOverlayEnable',
  isContextInPromptEnabled = 'isContextInPromptEnabled',
  customPromptWithContext = 'customPromptWithContext',
  customPromptWithoutContext = 'customPromptWithoutContext'
}
