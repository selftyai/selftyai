import { describe, it, expect, vi, beforeEach } from 'vitest'

import BackgroundService from '@/server/services/BackgroundService'

beforeEach(() => {
  global.chrome = {
    runtime: {
      onSuspend: {
        addListener: vi.fn()
      }
    }
  } as unknown as typeof chrome
})

vi.mock('@/server/services/BackgroundService', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn()
    }))
  }
})

describe('server index', () => {
  it('should start the background service', () => {
    const backgroundService = new BackgroundService()
    backgroundService.start()
    expect(backgroundService.start).toHaveBeenCalled()
  })
})
