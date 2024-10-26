import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'

import getOrCreateConversation from '@/server/utils/chat/getOrCreateConversation'
import { db } from '@/shared/db'

vi.mock('@/shared/db', () => {
  const mockDb = {
    conversations: {
      add: vi.fn(),
      get: vi.fn()
    }
  }
  return { db: mockDb }
})

describe('getOrCreateConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new conversation if id is not provided', async () => {
    const mockConversation = {
      modelId: 1,
      title: 'Test Conversation',
      messages: []
    }
    ;(db.conversations.add as Mock).mockResolvedValue(1)
    ;(db.conversations.get as Mock).mockResolvedValue({ id: 1, ...mockConversation })

    const result = await getOrCreateConversation(mockConversation)

    expect(db.conversations.add).toHaveBeenCalledWith(mockConversation)
    expect(db.conversations.get).toHaveBeenCalledWith(1)
    expect(result).toEqual({ id: 1, ...mockConversation })
  })

  it('should return an existing conversation if it is found', async () => {
    const mockConversation = {
      id: 1,
      modelId: 1,
      title: 'Existing Conversation',
      messages: []
    }

    ;(db.conversations.get as Mock).mockResolvedValue(mockConversation)

    const result = await getOrCreateConversation({
      id: 1,
      modelId: 1,
      title: 'Existing Conversation'
    })

    expect(db.conversations.get).toHaveBeenCalledWith(1)
    expect(result).toEqual(mockConversation)
  })

  it('should create a new conversation if an existing one is not found', async () => {
    const mockConversation = {
      modelId: 2,
      title: 'New Conversation',
      messages: []
    }

    ;(db.conversations.get as Mock).mockResolvedValueOnce(null)
    ;(db.conversations.add as Mock).mockResolvedValue(2)
    ;(db.conversations.get as Mock).mockResolvedValueOnce({ id: 2, ...mockConversation })

    const result = await getOrCreateConversation({ id: 2, modelId: 2, title: 'New Conversation' })

    expect(db.conversations.get).toHaveBeenCalledWith(2)
    expect(db.conversations.add).toHaveBeenCalledWith({
      modelId: 2,
      title: 'New Conversation',
      id: 2
    })
    expect(result).toEqual({ id: 2, ...mockConversation })
  })
})
