/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import getOllamaService from '@/server/core/ollama/getOllamaService'
import ollamaModels from '@/server/core/ollama/ollamaModels'

vi.mock('@/server/core/ollama/getOllamaService')

describe('ollamaModels', () => {
  const mockOllamaService = {
    getModels: vi.fn(),
    getBaseURL: vi.fn()
  }

  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getOllamaService).mockReturnValue(mockOllamaService as any)
  })

  it('should return models when successful', async () => {
    const mockModels = [{ name: 'model1' }, { name: 'model2' }]
    const url = 'http://localhost'

    mockOllamaService.getModels.mockResolvedValue(mockModels)
    mockOllamaService.getBaseURL.mockReturnValue(url)

    mockStorage.getItem.mockResolvedValue(true)

    const result = await ollamaModels({ storage: mockStorage })

    expect(getOllamaService).toHaveBeenCalled()
    expect(mockOllamaService.getModels).toHaveBeenCalled()
    expect(result).toEqual({ models: mockModels, connected: true, enabled: true, error: '', url })
  })

  it('should return an empty array and error message when getModels throws an error', async () => {
    const errorMessage = 'Failed to fetch models'
    const url = 'http://localhost'

    mockOllamaService.getModels.mockRejectedValue(new Error(errorMessage))
    mockOllamaService.getBaseURL.mockReturnValue(url)

    mockStorage.getItem.mockResolvedValue(true)

    const result = await ollamaModels({ storage: mockStorage })

    expect(getOllamaService).toHaveBeenCalled()
    expect(mockOllamaService.getModels).toHaveBeenCalled()
    expect(result).toEqual({
      models: [],
      error: errorMessage,
      connected: false,
      enabled: true,
      url
    })
  })
})
