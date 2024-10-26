import { describe, it, expect, vi } from 'vitest'

import GoogleSearchTool from '@/server/tools/GoogleSearchTool'
import TavilySearchTool from '@/server/tools/TavilySearchTool'
import getTools from '@/server/utils/chat/getTools'
import { Integrations } from '@/shared/types/Integrations'

vi.mock('@/server/tools/GoogleSearchTool', () => ({
  default: vi.fn()
}))

vi.mock('@/server/tools/TavilySearchTool', () => ({
  default: vi.fn()
}))

describe('getTools', () => {
  it('should return GoogleSearchTool when tools array includes google integration', () => {
    const tools = [Integrations.google]

    const result = getTools(tools)

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(GoogleSearchTool)
  })

  it('should return TavilySearchTool when tools array includes tavily integration', () => {
    const tools = [Integrations.tavily]

    const result = getTools(tools)

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(TavilySearchTool)
  })

  it('should return both tools when tools array includes both google and tavily integrations', () => {
    const tools = [Integrations.google, Integrations.tavily]

    const result = getTools(tools)

    expect(result).toHaveLength(2)
    expect(result).toContain(GoogleSearchTool)
    expect(result).toContain(TavilySearchTool)
  })

  it('should return an empty array if no matching tools are found', () => {
    const tools = ['unknown_integration']

    const result = getTools(tools)

    expect(result).toHaveLength(0)
  })
})
