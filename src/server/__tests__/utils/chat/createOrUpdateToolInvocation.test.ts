import { Collection } from 'dexie'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'

import createOrUpdateToolInvocation from '@/server/utils/chat/createOrUpdateToolInvocation'
import { db } from '@/shared/db'

vi.mock('@/shared/db', () => {
  const mockDb = {
    toolInvocations: {
      where: vi.fn().mockImplementation(() => {
        return {
          first: vi.fn()
        } as unknown as Collection<unknown>
      }),
      update: vi.fn(),
      add: vi.fn(),
      get: vi.fn()
    },
    transaction: vi.fn((_, __, callback) => callback())
  }
  return { db: mockDb }
})

describe('createOrUpdateToolInvocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update an existing ToolInvocation if found', async () => {
    const mockToolInvocation = {
      id: 1,
      toolName: 'testTool',
      runId: 'testRunId',
      messageId: 1,
      subName: 'subTest',
      input: 'input',
      output: 'output',
      status: 'loading',
      error: ''
    }

    ;(db.toolInvocations.where as Mock).mockImplementation(() => ({
      first: vi.fn().mockResolvedValue(mockToolInvocation)
    }))
    ;(db.toolInvocations.update as Mock).mockResolvedValue(1)

    const data = {
      toolName: 'testTool',
      runId: 'testRunId',
      input: 'newInput',
      messageId: 1
    }

    const result = await createOrUpdateToolInvocation(data)

    expect(db.toolInvocations.where).toHaveBeenCalledWith({
      toolName: data.toolName,
      runId: data.runId
    })
    expect(db.toolInvocations.update).toHaveBeenCalledWith(mockToolInvocation.id, data)
    expect(result).toEqual({ ...mockToolInvocation, ...data })
  })

  it('should add a new ToolInvocation if none exists', async () => {
    ;(db.toolInvocations.where as Mock).mockImplementation(() => ({
      first: vi.fn().mockResolvedValue(null)
    }))
    ;(db.toolInvocations.add as Mock).mockResolvedValue(2)
    ;(db.toolInvocations.get as Mock).mockResolvedValue({
      id: 2,
      toolName: 'newTool',
      runId: 'newRunId'
    })

    const data = {
      toolName: 'newTool',
      runId: 'newRunId',
      input: 'input',
      status: 'loading',
      subName: 'subTest',
      output: '',
      error: '',
      messageId: 1
    }

    const result = await createOrUpdateToolInvocation(data)

    expect(db.toolInvocations.where).toHaveBeenCalledWith({
      toolName: data.toolName,
      runId: data.runId
    })
    expect(db.toolInvocations.add).toHaveBeenCalledWith(data)
    expect(db.toolInvocations.get).toHaveBeenCalledWith(2)
    expect(result).toEqual({ id: 2, toolName: 'newTool', runId: 'newRunId' })
  })
})
