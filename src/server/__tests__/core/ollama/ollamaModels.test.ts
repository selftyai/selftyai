/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import ollamaModels from '@/server/core/ollama/ollamaModels'
import getOllamaService from '@/shared/getOllamaService'

vi.mock('@/shared/getOllamaService')

describe('ollamaModels', () => {
  const mockOllamaService = {
    getModels: vi.fn()
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getOllamaService).mockResolvedValue(mockOllamaService as any)
  })

  it('should return models when successful', async () => {
    const mockModels = [{ name: 'model1' }, { name: 'model2' }]
    mockOllamaService.getModels.mockResolvedValue(mockModels)

    const result = await ollamaModels()

    expect(getOllamaService).toHaveBeenCalled()
    expect(mockOllamaService.getModels).toHaveBeenCalled()
    expect(result).toEqual({ models: mockModels })
  })

  it('should return an empty array and error message when getModels throws an error', async () => {
    const errorMessage = 'Failed to fetch models'
    mockOllamaService.getModels.mockRejectedValue(new Error(errorMessage))

    const result = await ollamaModels()

    expect(getOllamaService).toHaveBeenCalled()
    expect(mockOllamaService.getModels).toHaveBeenCalled()
    expect(result).toEqual({
      models: [],
      error: errorMessage
    })
  })

  it('should handle non-Error object thrown by getModels', async () => {
    const errorString = 'Failed to fetch models'
    mockOllamaService.getModels.mockRejectedValue(errorString)

    const result = await ollamaModels()

    expect(getOllamaService).toHaveBeenCalled()
    expect(mockOllamaService.getModels).toHaveBeenCalled()
    expect(result).toEqual({
      models: [],
      error: errorString
    })
  })
})
