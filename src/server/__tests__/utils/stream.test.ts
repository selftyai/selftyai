import { describe, it, expect, vi } from 'vitest'

import { streamingFetch } from '@/server/utils/stream'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockResponse = (body: any) => {
  return {
    body: body
  } as unknown as Response
}

describe('streamingFetch', () => {
  it('should throw an error if response body is not readable', async () => {
    const mockInput = vi.fn().mockResolvedValue(createMockResponse(null))

    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of streamingFetch(mockInput)) {
        // Noop
      }
    }).rejects.toThrow('Response body is not readable')
  })

  it('should yield parsed JSON objects', async () => {
    const textEncoder = new TextEncoder()
    const chunks = [
      textEncoder.encode('{"key": "value1"} '),
      textEncoder.encode('{"key": "value2"} ')
    ]

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: chunks[0] })
        .mockResolvedValueOnce({ done: false, value: chunks[1] })
        .mockResolvedValueOnce({ done: true, value: null })
    }

    const mockInput = vi.fn().mockResolvedValue(createMockResponse({ getReader: () => mockReader }))

    const results = []
    for await (const result of streamingFetch(mockInput)) {
      results.push(result)
    }

    expect(results).toEqual([{ key: 'value1' }, { key: 'value2' }])
  })

  it('should handle JSON parse errors gracefully', async () => {
    const textEncoder = new TextEncoder()
    const chunks = [textEncoder.encode('{"key": "value1"} '), textEncoder.encode('{malformed JSON')]

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: chunks[0] })
        .mockResolvedValueOnce({ done: false, value: chunks[1] })
        .mockResolvedValueOnce({ done: true, value: null })
    }

    const mockInput = vi.fn().mockResolvedValue(createMockResponse({ getReader: () => mockReader }))

    const results = []
    for await (const result of streamingFetch(mockInput)) {
      results.push(result)
    }

    expect(results).toEqual([{ key: 'value1' }])
  })
})
