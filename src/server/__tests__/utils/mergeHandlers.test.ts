import { describe, it, expect, vi } from 'vitest'

import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import mergeHandlers from '@/server/utils/mergeHandlers'

class MockHandler<T = unknown, R = unknown> extends AbstractHandler<T, R> {
  constructor() {
    super()
    this.handle = vi.fn(this.handle.bind(this))
    this.setNext = vi.fn(this.setNext.bind(this))
  }

  handle(request: T): R {
    return super.handle(request)
  }
}

describe('mergeHandlers', () => {
  it('should return the first handler', () => {
    const handler1 = new MockHandler()
    const handler2 = new MockHandler()
    const mergedHandler = mergeHandlers(handler1, handler2)

    expect(mergedHandler).toBe(handler1)
  })

  it('should set the next handler for each handler in the chain', () => {
    const handler1 = new MockHandler()
    const handler2 = new MockHandler()
    const handler3 = new MockHandler()

    mergeHandlers(handler1, handler2, handler3)

    expect(handler1.setNext).toHaveBeenCalledWith(handler2)
    expect(handler2.setNext).toHaveBeenCalledWith(handler3)
  })

  it('should call handlers in sequence until one handles the request', () => {
    const handler1 = new MockHandler()
    const handler2 = new MockHandler()
    const handler3 = new MockHandler()

    mergeHandlers(handler1, handler2, handler3)

    handler3.handle = vi.fn(() => 'handled by handler3')

    const result = handler1.handle({})

    expect(result).toBe('handled by handler3')
    expect(handler1.handle).toHaveBeenCalled()
    expect(handler2.handle).toHaveBeenCalled()
    expect(handler3.handle).toHaveBeenCalled()
  })
})
