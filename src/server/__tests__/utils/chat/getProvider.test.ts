import { ChatGroq } from '@langchain/groq'
import { ChatOllama } from '@langchain/ollama'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'

import getProvider from '@/server/utils/chat/getProvider'
import createGroqService from '@/server/utils/groq/createGroqService'
import createOllamaService from '@/server/utils/ollama/createOllamaService'

vi.mock('@/server/utils/groq/createGroqService', () => ({
  default: vi.fn()
}))
vi.mock('@/server/utils/ollama/createOllamaService', () => ({
  default: vi.fn()
}))

const mockCreateGroqService = createGroqService as Mock
const mockCreateOllamaService = createOllamaService as Mock

const mockGroqService = {
  getBaseURL: vi.fn().mockReturnValue('mock-groq-base-url')
}
const mockOllamaService = {
  getBaseURL: vi.fn().mockReturnValue('mock-ollama-base-url')
}

describe('getProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateGroqService.mockResolvedValue(mockGroqService)
    mockCreateOllamaService.mockResolvedValue(mockOllamaService)
  })

  it('should create a ChatOllama instance for ollama provider', async () => {
    const model = 'ollama-model'
    const result = await getProvider('ollama', model)

    expect(createOllamaService).toHaveBeenCalled()
    expect(result).toBeInstanceOf(ChatOllama)
    expect(result.model).toBe(model)
  })

  it('should create a ChatGroq instance for groq provider', async () => {
    const model = 'groq-model'
    const result = await getProvider('groq', model)

    expect(createGroqService).toHaveBeenCalled()
    expect(result).toBeInstanceOf(ChatGroq)
    expect(result.model).toBe(model)
    expect(result.streaming).toBe(true)
  })

  it('should throw an error if the provider is not defined', async () => {
    await expect(getProvider('unknown', 'model')).rejects.toThrow('Provider unknown is not defined')
  })
})
