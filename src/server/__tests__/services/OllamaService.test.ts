import axios from 'axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { OllamaService } from '@/server/services/OllamaService'
import { AIProvider } from '@/shared/types/AIProvider'

describe('OllamaService', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.stubGlobal('chrome', {
      i18n: {
        getMessage: vi.fn((key) => key)
      }
    })

    vi.mock('axios')
  })

  it('should be a singleton', () => {
    const instance1 = OllamaService.getInstance()
    const instance2 = OllamaService.getInstance()
    expect(instance1).toBe(instance2)
  })

  describe('verifyConnection', () => {
    it('should verify connection successfully', async () => {
      const service = OllamaService.getInstance()
      service.setBaseURL('http://test.com')

      vi.spyOn(axios, 'get').mockResolvedValue({ data: 'Ollama is running' })
      vi.spyOn(axios, 'post').mockRejectedValue({ response: { status: 400 } })
      vi.spyOn(axios, 'isAxiosError').mockResolvedValue(true)

      await expect(service.verifyConnection()).resolves.toBe(true)
    })

    it('should throw an error if connection fails', async () => {
      const service = OllamaService.getInstance()
      service.setBaseURL('http://test.com')

      vi.spyOn(axios, 'get').mockResolvedValue({ data: 'Test' })
      vi.spyOn(axios, 'post').mockRejectedValue({ response: { status: 400 } })
      vi.spyOn(axios, 'isAxiosError').mockResolvedValue(true)

      await expect(service.verifyConnection()).rejects.toThrow('ollamaConnectionError')
    })

    it('should throw an error if Ollama origin is invalid', async () => {
      const service = OllamaService.getInstance()
      service.setBaseURL('http://test.com')

      vi.spyOn(axios, 'get').mockResolvedValue({ data: 'Ollama is running' })
      vi.spyOn(axios, 'post').mockRejectedValue({ response: { status: 403 } })
      vi.spyOn(axios, 'isAxiosError').mockResolvedValueOnce(true)

      await expect(service.verifyConnection()).rejects.toThrow('ollamaOriginError')
    })
  })

  describe('getModels', () => {
    it('should return models successfully', async () => {
      const service = OllamaService.getInstance()
      service.setBaseURL('http://test.com')

      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: 'Ollama is running' })
        .mockResolvedValueOnce({
          data: {
            models: [
              { name: 'model1', model: 'model1:latest' },
              { name: 'model2', model: 'model2:v1' }
            ]
          }
        })
      vi.mocked(axios.post)
        .mockRejectedValueOnce({ response: { status: 400 } })
        .mockResolvedValue({
          data: { projector_info: { 'clip.has_vision_encoder': true } }
        })
      vi.mocked(axios.isAxiosError).mockResolvedValueOnce(true)

      const models = await service.getModels()

      expect(models).toEqual([
        { name: 'model1', model: 'model1', provider: AIProvider.ollama, hasVision: true },
        { name: 'model2', model: 'model2:v1', provider: AIProvider.ollama, hasVision: true }
      ])
    })
  })

  describe('pullModel', () => {
    it('should pull a model successfully', async () => {
      const service = OllamaService.getInstance()
      service.setBaseURL('http://test.com')

      vi.mocked(axios.get).mockResolvedValueOnce({ data: 'Ollama is running' })
      vi.mocked(axios.post).mockRejectedValueOnce({ response: { status: 400 } })

      global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })

      const response = await service.pullModel('model1:latest')

      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('http://test.com/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'model1:latest' })
      })
    })
  })

  describe('deleteModel', () => {
    it('should delete a model successfully', async () => {
      const service = OllamaService.getInstance()
      service.setBaseURL('http://test.com')

      vi.mocked(axios.get).mockResolvedValueOnce({ data: 'Ollama is running' })
      vi.mocked(axios.post).mockRejectedValueOnce({ response: { status: 400 } })
      vi.mocked(axios.request).mockResolvedValueOnce({ data: {} })

      const result = await service.deleteModel('model1:latest')

      expect(result).toBe(true)
      expect(axios.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'http://test.com/api/delete',
        data: { name: 'model1:latest' }
      })
    })
  })
})
