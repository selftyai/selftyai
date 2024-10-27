import { ContentScriptMessage } from '@/shared/types/ContentScriptEndpoints'

export default async function sendMessageToContentScript(message: ContentScriptMessage) {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (!tab?.id) {
    throw new Error('No active tab found')
  }

  try {
    await chrome.tabs.sendMessage(tab.id, message)
  } catch (error) {
    console.error('Failed to send message to content script:', error)
    throw error
  }
}
