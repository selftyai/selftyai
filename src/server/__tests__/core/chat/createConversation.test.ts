/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import createConversation from '@/server/core/chat/createConversation'
import { ChatStorageKeys } from '@/server/types/chat/ChatStorageKeys'
import { Conversation } from '@/shared/types/Conversation'

describe('createConversation', () => {
  let mockStorage: any

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('mock-uuid')
    })

    vi.useFakeTimers()
  })

  it('should create a new conversation and add it to storage', async () => {
    const mockDate = new Date('2023-01-01T00:00:00Z')
    vi.setSystemTime(mockDate)

    mockStorage.getItem.mockResolvedValue('[]')

    const newConversation = {
      title: 'Test Conversation',
      model: 'gpt-3.5-turbo',
      provider: 'openai'
    } as unknown as Conversation

    const result = await createConversation(newConversation, mockStorage)

    expect(result).toEqual({
      ...newConversation,
      id: 'mock-uuid',
      createdAt: mockDate,
      updatedAt: mockDate,
      messages: []
    })

    expect(mockStorage.getItem).toHaveBeenCalledWith(ChatStorageKeys.conversations)
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      ChatStorageKeys.conversations,
      JSON.stringify([result])
    )
  })

  it('should add a new conversation to existing conversations', async () => {
    const mockDate = new Date('2023-01-01T00:00:00Z')
    vi.setSystemTime(mockDate)

    const existingConversations = [
      {
        id: 'existing-id',
        title: 'Existing Conversation',
        model: 'gpt-4',
        provider: 'openai',
        createdAt: new Date('2022-12-31T23:59:59Z'),
        updatedAt: new Date('2022-12-31T23:59:59Z'),
        messages: []
      }
    ]

    mockStorage.getItem.mockResolvedValue(JSON.stringify(existingConversations))

    const newConversation = {
      title: 'New Conversation',
      model: 'gpt-3.5-turbo',
      provider: 'openai'
    } as unknown as Conversation

    const result = await createConversation(newConversation, mockStorage)

    expect(result).toEqual({
      ...newConversation,
      id: 'mock-uuid',
      createdAt: mockDate,
      updatedAt: mockDate,
      messages: []
    })

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      ChatStorageKeys.conversations,
      JSON.stringify([...existingConversations, result])
    )
  })

  it('should handle empty storage', async () => {
    const mockDate = new Date('2023-01-01T00:00:00Z')
    vi.setSystemTime(mockDate)

    mockStorage.getItem.mockResolvedValue(null)

    const newConversation = {
      title: 'Test Conversation',
      model: 'gpt-3.5-turbo',
      provider: 'openai'
    } as unknown as Conversation

    const result = await createConversation(newConversation, mockStorage)

    expect(result).toEqual({
      ...newConversation,
      id: 'mock-uuid',
      createdAt: mockDate,
      updatedAt: mockDate,
      messages: []
    })

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      ChatStorageKeys.conversations,
      JSON.stringify([result])
    )
  })
})
