import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents'

import { MessageEvent } from '@/server/types/MessageEvent'
import getProvider from '@/server/utils/chat/getProvider'
import { db } from '@/shared/db'
import { Conversation } from '@/shared/db/models/Conversation'

import createOrUpdateToolInvocation from './createOrUpdateToolInvocation'
import getMappedMessages from './getMappedMessages'
import getTools from './getTools'

interface StreamChatMessageProps {
  conversation: Conversation
  modelId: number
  port: chrome.runtime.Port
  useLastMessage?: boolean
  tools: string[]
}

export default async function streamChatMessage({
  conversation,
  modelId,
  port,
  useLastMessage = false,
  tools
}: StreamChatMessageProps): Promise<boolean> {
  if (!conversation.id) {
    console.warn('[streamChatMessage] Conversation not found:', conversation.id)
    return false
  }

  const { id: conversationId } = conversation
  const abortController = new AbortController()

  const model = await db.models.where({ id: modelId }).first()

  if (!model) {
    console.warn('[streamChatMessage] Model not found:', modelId)
    return false
  }

  const assistantMessageId = useLastMessage
    ? (await db.messages.where({ conversationId, role: 'assistant' }).last())?.id
    : await db.messages.add({
        role: 'assistant',
        content: '',
        conversationId,
        modelId,
        availableTools: tools
      })

  if (!assistantMessageId) {
    console.warn('[streamChatMessage] Assistant message not found')
    return false
  }

  const assistantMessage = await db.messages.where({ id: assistantMessageId }).first()

  if (!assistantMessage) {
    console.warn('[streamChatMessage] Assistant message not found:', assistantMessageId)
    return false
  }

  await db.messages.where({ conversationId, role: 'assistant' }).modify({
    error: undefined,
    finishReason: undefined,
    availableTools: tools
  })

  port.onMessage.addListener(async (message: MessageEvent<{ conversationId: number }>) => {
    if (message.type === 'stop' && message.payload.conversationId === conversationId) {
      abortController.abort()
    }
  })

  const messages = await db.messages.where({ conversationId }).toArray()
  const files = await db.files.where({ conversationId }).toArray()

  const mappedMessages = getMappedMessages(
    messages.slice(
      0,
      useLastMessage && assistantMessage.content.length > 0 ? messages.length : messages.length - 1
    ),
    files
  )

  await db.conversations.update(conversationId, {
    generating: true
  })

  try {
    const llm = await getProvider(model.provider, model.model)

    const modifiedModel = Object.create(Object.getPrototypeOf(llm))
    Object.assign(modifiedModel, llm)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modifiedModel.bindTools = (tools: any[], options: any) => {
      return llm?.bindTools?.(tools, {
        ...options,
        recursionLimit: 5,
        signal: abortController.signal
      })
    }

    const messagePlaceholders = new MessagesPlaceholder('chat_history')
    const prompt = ChatPromptTemplate.fromMessages([
      conversation.systemMessage ? ['system', conversation.systemMessage] : '',
      messagePlaceholders,
      ['placeholder', '{agent_scratchpad}']
    ])

    const tools = getTools(assistantMessage.availableTools || [])

    let agentExecutor: AgentExecutor | undefined

    if (model.supportTool && tools.length) {
      const agentWithTool = createToolCallingAgent({
        llm: modifiedModel,
        tools,
        prompt: prompt,
        streamRunnable: true
      })

      agentExecutor = new AgentExecutor({
        agent: agentWithTool,
        tools,
        maxIterations: 5
      })
    }
    const chainWithoutTools = prompt.pipe(
      llm.bind({
        signal: abortController?.signal
      })
    )

    const executor = agentExecutor ? agentExecutor : chainWithoutTools

    await executor.invoke(
      {
        chat_history: mappedMessages
      },
      {
        signal: abortController.signal,
        maxConcurrency: 1,
        recursionLimit: 3,
        callbacks: [
          {
            handleLLMStart: async () => {},
            handleToolStart: async (tool, input, runId, _, __, ___, runName) => {
              await createOrUpdateToolInvocation({
                toolName: runName || tool.name || 'unknown',
                runId,
                input,
                messageId: assistantMessageId
              })
            },
            handleLLMNewToken: async (token: string) => {
              await db.messages.update(assistantMessageId, {
                content: assistantMessage.content + token
              })
              assistantMessage.content += token
            },
            handleLLMError: async (err: Error) => {
              const finishReason = abortController?.signal.aborted ? 'aborted' : 'error'
              const errorName = abortController?.signal.aborted ? 'AbortedError' : err.message

              await db.messages.update(assistantMessageId, {
                finishReason,
                error: errorName
              })
            },
            handleLLMEnd: async (output) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { message } = output.generations[0][0]

              if (message.tool_calls && !message.tool_calls.length) {
                await db.conversations.update(conversationId, {
                  generating: false
                })

                await db.messages.update(assistantMessageId, {
                  promptTokens: message.usage_metadata.input_tokens,
                  completionTokens: message.usage_metadata.output_tokens,
                  totalTokens: message.usage_metadata.total_tokens,
                  finishReason: message.response_metadata.done_reason
                })
              }
            }
          }
        ]
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      const finishReason = abortController?.signal.aborted ? 'aborted' : 'error'
      const errorName = abortController?.signal.aborted ? 'AbortedError' : error.message

      await db.messages.update(assistantMessageId, {
        finishReason,
        error: errorName
      })
    }

    await db.conversations.update(conversationId, {
      generating: false
    })

    return false
  }

  return true
}
