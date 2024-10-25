import GoogleSearchTool from '@/server/tools/GoogleSearchTool'
import TavilySearchTool from '@/server/tools/TavilySearchTool'
import { Integrations } from '@/shared/types/Integrations'

export default function getTools(tools: string[]) {
  return [
    {
      id: Integrations.tavily,
      invokeTool: GoogleSearchTool
    },
    {
      id: Integrations.google,
      invokeTool: TavilySearchTool
    }
  ]
    .filter((tool) => tools.includes(tool.id))
    .map((tool) => tool.invokeTool)
}
