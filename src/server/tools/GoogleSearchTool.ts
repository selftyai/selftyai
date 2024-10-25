import { DynamicStructuredTool } from '@langchain/core/tools'
import axios from 'axios'
import { z } from 'zod'

import createOrUpdateToolInvocation from '@/server/utils/chat/createOrUpdateToolInvocation'
import { db } from '@/shared/db'
import { Integrations } from '@/shared/types/Integrations'

export interface GoogleSearchResponse {
  title: string
  snippet: string
  link: string
}

const googleSearchSchema = z.object({
  input: z.string()
})

const googleSearchPrompt = (input: string, information: string) =>
  `Answer the following question based on the information provided. Question: ${input} \n\n Information: \n\n ${information}`

const GoogleSearchTool = new DynamicStructuredTool({
  name: 'web_search',
  description:
    "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query. Don't use tool if already used it to answer the question.",
  schema: googleSearchSchema,
  func: async ({ input }, runManager) => {
    const randomUUID = crypto.randomUUID()

    await createOrUpdateToolInvocation({
      toolName: 'web_search',
      subName: 'google_search',
      runId: runManager?.runId || randomUUID,
      input: input,
      output: '',
      error: '',
      status: 'loading'
    })

    const integration = await db.integrations.where({ name: Integrations.google }).first()

    try {
      if (!integration) {
        throw new Error('Google integration not found')
      }

      if (!integration.apiKey) {
        throw new Error('Google API key not found')
      }

      if (!integration.active) {
        throw new Error('Google integration is not enabled')
      }

      const url = 'https://www.googleapis.com/customsearch/v1'
      const params = {
        key: integration.apiKey,
        cx: integration.baseURL,
        q: input
      }

      const response = await axios.get(url, { params })

      if (response.status !== 200) {
        runManager?.handleToolError('Error performing Google search')
        throw new Error('Invalid response')
      }

      const googleSearchResult = response?.data?.items
        ?.slice(0, 5)
        ?.map((item: GoogleSearchResponse) => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link
        }))

      const information = googleSearchResult
        ?.map(
          (result: GoogleSearchResponse) => `
							title: ${result?.title},
							markdown: ${result?.snippet},
							url: ${result?.link},
						`
        )
        .join('\n\n')

      await createOrUpdateToolInvocation({
        toolName: 'web_search',
        subName: 'google_search',
        runId: runManager?.runId || randomUUID,
        input: input,
        output: JSON.stringify(
          googleSearchResult.map((result: GoogleSearchResponse) => ({
            title: result.title,
            content: result.snippet,
            url: result.link
          }))
        ),
        error: '',
        status: 'success'
      })

      return googleSearchPrompt(input, information)
    } catch (error) {
      await createOrUpdateToolInvocation({
        toolName: 'web_search',
        subName: 'google_search',
        runId: runManager?.runId || randomUUID,
        input: input,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        status: 'error'
      })
      throw error
    }
  }
})

export default GoogleSearchTool
