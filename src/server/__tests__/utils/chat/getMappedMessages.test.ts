import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { describe, it, expect } from 'vitest'

import getMappedMessages from '@/server/utils/chat/getMappedMessages'
import { File } from '@/shared/db/models/File'
import { Message } from '@/shared/db/models/Message'

const createMessage = (id: number, role: 'assistant' | 'user', content: string) => ({
  id,
  role,
  content
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createFile = (messageId: number, type: string, data: any) => ({ messageId, type, data })

describe('getMappedMessages', () => {
  it('should map assistant messages to AIMessage instances', () => {
    const messages = [
      createMessage(1, 'assistant', 'This is an AI message')
    ] as unknown as Message[]
    const files: File[] = []

    const result = getMappedMessages(messages, files)

    expect(result[0]).toBeInstanceOf(AIMessage)
    expect(result[0].content).toBe('This is an AI message')
  })

  it('should map user messages to HumanMessage instances', () => {
    const messages = [createMessage(2, 'user', 'This is a user message')] as unknown as Message[]
    const files: File[] = []

    const result = getMappedMessages(messages, files)

    expect(result[0]).toBeInstanceOf(HumanMessage)
    expect(result[0].content).toBe('This is a user message')
  })

  it('should include files associated with a user message', () => {
    const messages = [createMessage(3, 'user', 'Message with files')] as unknown as Message[]
    const files = [
      createFile(3, 'image', 'http://example.com/image1.jpg'),
      createFile(3, 'image', 'http://example.com/image2.jpg')
    ] as unknown as File[]

    const result = getMappedMessages(messages, files)

    expect(result[0]).toBeInstanceOf(HumanMessage)
    expect(Array.isArray(result[0].content)).toBe(true)
    expect(result[0].content).toHaveLength(3)
    expect(result[0].content[0]).toEqual({ text: 'Message with files', type: 'text' })
    expect(result[0].content[1]).toEqual({
      type: 'image_url',
      image_url: { url: 'http://example.com/image1.jpg' }
    })
    expect(result[0].content[2]).toEqual({
      type: 'image_url',
      image_url: { url: 'http://example.com/image2.jpg' }
    })
  })

  it('should not include non-image files in the message content', () => {
    const messages = [createMessage(4, 'user', 'Message with mixed files')] as unknown as Message[]
    const files = [
      createFile(4, 'image', 'http://example.com/image.jpg'),
      createFile(4, 'document', 'http://example.com/doc.pdf')
    ] as unknown as File[]

    const result = getMappedMessages(messages, files)

    expect(result[0]).toBeInstanceOf(HumanMessage)
    expect(Array.isArray(result[0].content)).toBe(true)
    expect(result[0].content).toHaveLength(2)
    expect(result[0].content[0]).toEqual({ text: 'Message with mixed files', type: 'text' })
    expect(result[0].content[1]).toEqual({
      type: 'image_url',
      image_url: { url: 'http://example.com/image.jpg' }
    })
  })
})
