import { describe, it, expect, vi, beforeEach } from 'vitest'

import getConversations from '@/server/core/chat/getConversations'

vi.mock('@/utils/storage', () => ({
  createChromeStorage: vi.fn()
}))

describe('getConversations', () => {
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return an empty array when no conversations are stored', async () => {
    mockStorage.getItem.mockResolvedValue(null)

    const result = await getConversations({ storage: mockStorage })

    expect(mockStorage.getItem).toHaveBeenCalledWith('chat-conversations')
    expect(result).toEqual({ conversations: [] })
  })

  it('should return parsed conversations when they exist in storage', async () => {
    const mockConversations = [
      { id: '1', messages: [{ role: 'user', content: 'Hello' }] },
      { id: '2', messages: [{ role: 'user', content: 'How are you?' }] }
    ]
    mockStorage.getItem.mockResolvedValue(JSON.stringify(mockConversations))

    const result = await getConversations({ storage: mockStorage })

    expect(mockStorage.getItem).toHaveBeenCalledWith('chat-conversations')
    expect(result).toEqual({ conversations: mockConversations })
  })
})
