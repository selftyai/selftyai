import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'

import generateTitle from '@/server/utils/chat/generateTitle'
import getProvider from '@/server/utils/chat/getProvider'
import { db } from '@/shared/db'

vi.mock('@/shared/db', () => {
  const mockDb = {
    conversations: {
      where: vi.fn().mockReturnValue({
        first: vi.fn(),
        update: vi.fn()
      }),
      update: vi.fn()
    },
    models: {
      where: vi.fn().mockReturnValue({
        first: vi.fn()
      })
    },
    messages: {
      where: vi.fn().mockReturnValue({
        first: vi.fn()
      })
    }
  }
  return { db: mockDb }
})

vi.mock('@/server/utils/chat/getProvider', () => {
  return {
    default: vi.fn()
  }
})

describe('generateTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false if conversation is not found', async () => {
    ;(db.conversations.where({}).first as Mock).mockResolvedValue(null)

    const result = await generateTitle(1)

    expect(db.conversations.where).toHaveBeenCalledWith({ id: 1 })
    expect(result).toBe(false)
  })

  it('should return false if model is not found', async () => {
    ;(db.conversations.where({}).first as Mock).mockResolvedValue({
      id: 1,
      modelId: 2,
      title: 'New chat'
    })
    ;(db.models.where({}).first as Mock).mockResolvedValue(null)

    const result = await generateTitle(1)

    expect(db.conversations.where).toHaveBeenCalledWith({ id: 1 })
    expect(db.models.where).toHaveBeenCalledWith({ id: 2 })
    expect(result).toBe(false)
  })

  it('should return false if user message is not found', async () => {
    ;(db.conversations.where({}).first as Mock).mockResolvedValue({
      id: 1,
      modelId: 2,
      title: 'New chat'
    })
    ;(db.models.where({}).first as Mock).mockResolvedValue({
      id: 2,
      provider: 'testProvider',
      name: 'testName'
    })
    ;(db.messages.where({}).first as Mock).mockResolvedValue(null)

    const result = await generateTitle(1)

    expect(db.messages.where).toHaveBeenCalledWith({ conversationId: 1, role: 'user' })
    expect(result).toBe(false)
  })

  it('should update conversation title if all data is found', async () => {
    const mockProvider = {
      invoke: vi.fn().mockResolvedValue({ text: 'Generated Title' })
    }

    ;(db.conversations.where({}).first as Mock).mockResolvedValue({
      id: 1,
      modelId: 2,
      title: 'New chat'
    })
    ;(db.models.where({}).first as Mock).mockResolvedValue({
      id: 2,
      provider: 'testProvider',
      name: 'testName'
    })
    ;(db.messages.where({}).first as Mock).mockResolvedValue({
      conversationId: 1,
      role: 'user',
      content: 'User prompt content'
    })
    ;(getProvider as Mock).mockResolvedValue(mockProvider)

    const result = await generateTitle(1)

    expect(db.conversations.update).toHaveBeenCalledWith(1, { title: 'Generated Title' })
    expect(result).toBe(true)
  })
})
