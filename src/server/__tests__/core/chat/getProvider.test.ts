import { createOllama } from 'ollama-ai-provider'
import { describe, it, expect, vi } from 'vitest'

import getProvider from '@/server/core/chat/getProvider'
import { OllamaService } from '@/server/services/OllamaService'
import { AIProvider } from '@/shared/types/AIProvider'

vi.mock('ollama-ai-provider')
vi.mock('@/server/services/OllamaService', () => ({
  OllamaService: {
    getInstance: vi.fn(),
    prototype: {
      getBaseURL: vi.fn()
    }
  }
}))

describe('getProvider', () => {
  it('should return Ollama provider when AIProvider.ollama is passed', () => {
    const mockBaseURL = 'http://localhost:11434'
    const mockOllamaService = {
      getBaseURL: vi.fn().mockReturnValue(mockBaseURL)
    } as unknown as OllamaService

    vi.mocked(OllamaService.getInstance).mockReturnValue(mockOllamaService)

    const mockCreateOllama = {
      languageModel: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    vi.mocked(createOllama).mockReturnValue(mockCreateOllama)

    const result = getProvider(AIProvider.ollama)

    expect(OllamaService.getInstance).toHaveBeenCalledTimes(1)
    expect(mockOllamaService.getBaseURL).toHaveBeenCalledTimes(1)
    expect(createOllama).toHaveBeenCalledWith({
      baseURL: `${mockBaseURL}/api`
    })
    expect(result).toEqual(mockCreateOllama)
  })

  it('should throw an error for unsupported providers', () => {
    expect(() => getProvider('OpenAI' as AIProvider)).toThrow('Provider OpenAI is not defined')
  })
})
