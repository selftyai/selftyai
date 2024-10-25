import { describe, it, expect } from 'vitest'

import { BaseService } from '@/server/services/BaseService'
import { Model } from '@/shared/types/Model'

class TestService extends BaseService {
  static getInstance(): TestService {
    return new TestService()
  }

  async verifyConnection(): Promise<boolean> {
    return true
  }

  async getModels(): Promise<Model[]> {
    return []
  }
}

describe('BaseService', () => {
  it('should throw an error when calling getInstance on BaseService', () => {
    expect(() => BaseService.getInstance()).toThrow(
      'getInstance method must be implemented in derived class'
    )
  })

  it('should not throw an error when calling verifyConnection on TestService', async () => {
    const service = TestService.getInstance()
    await expect(service.verifyConnection()).resolves.toBe(true)
  })

  it('should not throw an error when calling getModels on TestService', async () => {
    const service = TestService.getInstance()
    await expect(service.getModels()).resolves.toEqual([])
  })

  it('should set and get baseURL correctly', () => {
    const service = TestService.getInstance()
    const testURL = 'http://test.com'
    service.setBaseURL(testURL)
    expect(service.getBaseURL()).toBe(testURL)
  })
})
