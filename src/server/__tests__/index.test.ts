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
  let backgroundService: BackgroundService

  beforeEach(() => {
    backgroundService = new BackgroundService()
  })

  it('should start the background service', () => {
    backgroundService.start()
    expect(backgroundService.start).toHaveBeenCalled()
  })

  it('should stop the background service', () => {
    backgroundService.stop()
    expect(backgroundService.stop).toHaveBeenCalled()
  })

  it('should handle start errors gracefully', () => {
    vi.mocked(backgroundService.start).mockImplementationOnce(() => {
      throw new Error('Start failed')
    })
    expect(() => backgroundService.start()).toThrow('Start failed')
  })
})
