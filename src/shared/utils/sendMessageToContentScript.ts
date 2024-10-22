import { ContentScriptMessage } from '@/shared/types/ContentScriptEndpoints'

export default async function sendMessageToContentScript(message: ContentScriptMessage) {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, message)
  }
}
