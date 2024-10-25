import { describe, it, expect, vi, beforeEach } from 'vitest'

import deleteConversation from '@/server/core/chat/deleteConversation'
import getConversations from '@/server/core/chat/getConversations'
import { StateStorage } from '@/server/types/Storage'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { Conversation } from '@/shared/types/Conversation'

vi.mock('@/server/core/chat/getConversations')

describe('deleteConversation', () => {
  let mockStorage: StateStorage

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }

    vi.resetAllMocks()
  })

  it('should delete a conversation and return updated conversations', async () => {
    const mockConversations = [
      { id: '1', title: 'Conversation 1' },
      { id: '2', title: 'Conversation 2' },
      { id: '3', title: 'Conversation 3' }
    ] as unknown as Conversation[]

    vi.mocked(getConversations).mockResolvedValue({ conversations: mockConversations })

    const result = await deleteConversation({ id: '2', storage: mockStorage })
    expect(getConversations).toHaveBeenCalledWith({ storage: mockStorage })

    expect(result.conversations).toEqual([
      { id: '1', title: 'Conversation 1' },
      { id: '3', title: 'Conversation 3' }
    ])

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      ChatStorageKeys.conversations,
      JSON.stringify([
        { id: '1', title: 'Conversation 1' },
        { id: '3', title: 'Conversation 3' }
      ])
    )

    expect(result.payload).toEqual({ id: '2' })
  })

  it('should handle deleting a non-existent conversation', async () => {
    const mockConversations = [
      { id: '1', title: 'Conversation 1' },
      { id: '2', title: 'Conversation 2' }
    ] as unknown as Conversation[]

    vi.mocked(getConversations).mockResolvedValue({ conversations: mockConversations })

    const result = await deleteConversation({ id: '3', storage: mockStorage })

    expect(result.conversations).toEqual(mockConversations)
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      ChatStorageKeys.conversations,
      JSON.stringify(mockConversations)
    )
    expect(result.payload).toEqual({ id: '3' })
  })

  it('should handle empty conversations array', async () => {
    vi.mocked(getConversations).mockResolvedValue({ conversations: [] })

    const result = await deleteConversation({ id: '1', storage: mockStorage })

    expect(result.conversations).toEqual([])
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      ChatStorageKeys.conversations,
      JSON.stringify([])
    )
    expect(result.payload).toEqual({ id: '1' })
  })
})
