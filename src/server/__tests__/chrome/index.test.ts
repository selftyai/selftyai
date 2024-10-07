import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as core from '@/server/core'
import { checkOngoingPulls } from '@/server/core/ollama/ollamaPullModel'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

// Mock Chrome API
const mockChrome = {
  sidePanel: {
    setPanelBehavior: vi.fn()
  },
  runtime: {
    onConnect: {
      addListener: vi.fn()
    }
  }
}

vi.stubGlobal('chrome', mockChrome)

// Mock core functions
vi.mock('@/server/core', () => ({
  ollamaModels: vi.fn(),
  ollamaVerifyConnection: vi.fn(),
  ollamaPullModel: vi.fn(),
  deleteModel: vi.fn(),
  getConversations: vi.fn(),
  sendMessage: vi.fn(),
  deleteConversation: vi.fn(),
  changeBaseUrl: vi.fn()
}))

// Mock checkOngoingPulls
vi.mock('@/server/core/ollama/ollamaPullModel', () => ({
  checkOngoingPulls: vi.fn()
}))

// Mock createChromeStorage
vi.mock('@/server/utils/chromeStorage', () => ({
  createChromeStorage: vi.fn()
}))

describe('Chrome Extension Background Script', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('should set up the extension correctly', async () => {
    await import('@/server/chrome/index')

    expect(mockChrome.sidePanel.setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true
    })
    expect(mockChrome.runtime.onConnect.addListener).toHaveBeenCalled()
    expect(checkOngoingPulls).toHaveBeenCalled()
  })

  it('should handle port connections and messages', async () => {
    await import('@/server/chrome/index')

    const mockPort = {
      onDisconnect: { addListener: vi.fn() },
      onMessage: { addListener: vi.fn() },
      postMessage: vi.fn()
    }

    const onConnectListener = mockChrome.runtime.onConnect.addListener.mock.calls[0][0]
    onConnectListener(mockPort)

    expect(mockPort.onDisconnect.addListener).toHaveBeenCalled()
    expect(mockPort.onMessage.addListener).toHaveBeenCalled()

    const onMessageListener = mockPort.onMessage.addListener.mock.calls[0][0]
    await onMessageListener({ type: ServerEndpoints.ollamaModels, payload: {} })

    expect(core.ollamaModels).toHaveBeenCalled()
    expect(mockPort.postMessage).toHaveBeenCalled()
  })

  it('should handle unknown message types', async () => {
    await import('@/server/chrome/index')

    const mockPort = {
      onDisconnect: { addListener: vi.fn() },
      onMessage: { addListener: vi.fn() },
      postMessage: vi.fn()
    }

    const onConnectListener = mockChrome.runtime.onConnect.addListener.mock.calls[0][0]
    onConnectListener(mockPort)

    const onMessageListener = mockPort.onMessage.addListener.mock.calls[0][0]
    await onMessageListener({ type: 'unknownType', payload: {} })

    expect(mockPort.postMessage).not.toHaveBeenCalled()
  })
})
