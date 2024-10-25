import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

import createOrUpdateToolInvocation from '@/server/utils/chat/createOrUpdateToolInvocation'
import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'

const webSearchSchema = z.object({
  input: z.string()
})

const tavilySearchPropmt = (input: string, information: string) =>
  `Answer the following question from the information provided. Question: ${input} \n\n Information: \n\n ${information}`

export interface TavilySearchResponse {
  title: string
  content: string
  url: string
}

const TavilySearchTool = new DynamicStructuredTool({
  name: 'web_search',
  description:
    "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query. Don't use tool if already used it to answer the question.",
  schema: webSearchSchema,
  func: async ({ input }, runManager) => {
    const randomUUID = crypto.randomUUID()

    await createOrUpdateToolInvocation({
      toolName: 'web_search',
      subName: 'tavily_search',
      runId: runManager?.runId || randomUUID,
      input: input,
      output: '',
      error: '',
      status: 'loading'
    })

    const integration = await db.integrations.where({ name: Integrations.tavily }).first()

    try {
      if (!integration) {
        throw new Error('Tavily integration not found')
      }

      if (!integration.apiKey) {
        throw new Error('Tavily API key not found')
      }

      if (!integration.active) {
        throw new Error('Tavily integration is not enabled')
      }

      const tool = new TavilySearchResults({
        maxResults: 5,
        apiKey: integration.apiKey
      })
      const results = await tool.invoke({ input })

      const data = JSON.parse(results)

      const information = data
        ?.map((result: TavilySearchResponse) =>
          `
				      title: ${result.title},
				      snippet: ${result.content},
				      link: ${result.url}
			      `.trim()
        )
        .join('\n\n')

      await createOrUpdateToolInvocation({
        toolName: 'web_search',
        subName: 'tavily_search',
        runId: runManager?.runId || randomUUID,
        input: input,
        output: JSON.stringify(data),
        error: '',
        status: 'success'
      })

      return tavilySearchPropmt(input, information)
    } catch (error) {
      await createOrUpdateToolInvocation({
        toolName: 'web_search',
        subName: 'tavily_search',
        runId: runManager?.runId || randomUUID,
        input: input,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        status: 'error'
      })

      return 'An error occurred while searching the web. Please try again or use a different tool.'
    }
  }
})

export default TavilySearchTool
