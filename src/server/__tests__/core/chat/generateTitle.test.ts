/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText } from 'ai'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import generateTitle from '@/server/core/chat/generateTitle'
import getProvider from '@/server/core/chat/getProvider'
import { Conversation } from '@/shared/types/Conversation'

// Mock dependencies
vi.mock('@/server/core/chat/getProvider')
vi.mock('ai')

describe('generateTitle', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should generate a title for a conversation', async () => {
    const mockConversation = {
      id: '1',
      title: '',
      messages: [{ role: 'user', content: 'Hello, how are you?' }],
      model: 'gpt-3.5-turbo',
      provider: 'openai'
    } as unknown as Conversation

    const mockProvider = vi.fn()
    vi.mocked(getProvider).mockReturnValue(mockProvider as any)

    vi.mocked(generateText).mockResolvedValue({ text: 'Friendly Greetings 👋' } as any)

    const result = await generateTitle(mockConversation)

    expect(getProvider).toHaveBeenCalledWith('openai')
    expect(mockProvider).toHaveBeenCalledWith('gpt-3.5-turbo')
    expect(result).toBe('Friendly Greetings 👋')
  })

  it('should handle errors gracefully', async () => {
    const mockConversation: Conversation = {
      id: '1',
      title: '',
      messages: [{ role: 'user', content: 'Hello, how are you?' }],
      model: 'gpt-3.5-turbo',
      provider: 'openai'
    } as unknown as Conversation

    vi.mocked(getProvider).mockImplementation(() => {
      throw new Error('Provider not found')
    })

    await expect(generateTitle(mockConversation)).rejects.toThrow('Provider not found')
  })

  it('should work with different providers and models', async () => {
    const mockConversation: Conversation = {
      id: '1',
      title: '',
      messages: [{ role: 'user', content: 'What is the capital of France?' }],
      model: 'llama2',
      provider: 'ollama'
    } as unknown as Conversation

    const mockProvider = vi.fn()
    vi.mocked(getProvider).mockReturnValue(mockProvider as any)

    vi.mocked(generateText).mockResolvedValue({ text: 'Exploring World Capitals 🌍' } as any)

    const result = await generateTitle(mockConversation)

    expect(getProvider).toHaveBeenCalledWith('ollama')
    expect(mockProvider).toHaveBeenCalledWith('llama2')
    expect(result).toBe('Exploring World Capitals 🌍')
  })
})
