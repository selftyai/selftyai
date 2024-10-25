/* eslint-disable react-refresh/only-export-components */
import { useLiveQuery } from 'dexie-react-hooks'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { db } from '@/shared/db'
import { File } from '@/shared/db/models/File'
import type { Model } from '@/shared/db/models/Model'
import logger from '@/shared/logger'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'
import { useOllama } from '@/sidebar/providers/OllamaProvider'
import { ConversationWithLastMessage } from '@/sidebar/types/ConversationWithLastMessage'
import { ConversationWithModel } from '@/sidebar/types/ConversationWithModel'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'

const ModelContext = React.createContext<
  | {
      models: Model[]
      selectedModel?: Model
      selectModel: (model: string) => void
    }
  | undefined
>(undefined)

const ChatContext = React.createContext<
  | {
      conversations?: ConversationWithLastMessage[]
      selectedConversation?: ConversationWithModel
      messages?: MessageWithFiles[]
      messageContext?: string
      tools: string[]
      sendMessage: (
        message: string,
        images: Omit<File, 'conversationId' | 'messageId'>[]
      ) => Promise<void>
      deleteConversation: (id?: number) => Promise<void>
      pinConversation: (id?: number) => Promise<void>
      unpinConversation: (id?: number) => Promise<void>
      regenerateResponse: () => void
      stopGenerating: () => void
      continueGenerating: () => void
      setMessageContext: (context: string | undefined) => void
      setTools: (tools: string[]) => void
    }
  | undefined
>(undefined)

export const useModels = () => {
  const context = React.useContext(ModelContext)
  if (!context) {
    throw new Error('useModels must be used within a ModelProvider')
  }
  return context
}

export const useChat = () => {
  const context = React.useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sendMessage: sendPortMessage, addMessageListener } = useChromePort()

  const { t } = useTranslation()

  const { conversationId } = useParams()
  const navigator = useNavigate()

  const { models: ollamaModels } = useOllama()

  const [selectedModel, setSelectedModel] = React.useState<Model>()
  const [messageContext, setMessageContext] = React.useState<string>()
  const [tools, setTools] = React.useState<string[]>([])

  const models = useMemo<Model[]>(() => {
    const newModels = [...(ollamaModels ?? [])]

    if (
      ollamaModels &&
      selectedModel &&
      !newModels
        .map(({ name, provider }) => `${name}-${provider}`)
        .includes(`${selectedModel.name}-${selectedModel.provider}`)
    ) {
      setSelectedModel(undefined)
    }

    return newModels
  }, [ollamaModels, selectedModel])

  const selectedConversation = useLiveQuery(async () => {
    if (!conversationId) return undefined

    const data = await db.conversations.where({ id: Number(conversationId) }).first()

    if (!data) {
      navigator('/')
      return undefined
    }

    const model = await db.models.get(data.modelId)
    setSelectedModel(model)

    return { ...data, model }
  }, [conversationId])

  const messages = useLiveQuery(async () => {
    if (!conversationId) return []

    const messages = await db.messages.where({ conversationId: Number(conversationId) }).toArray()
    const files = await db.files.where({ conversationId: Number(conversationId) }).toArray()
    const tools = await db.toolInvocations.toArray()

    const messagesWithFiles: MessageWithFiles[] = messages.map((message) => {
      return {
        ...message,
        files: files.filter((file) => file.messageId === message.id),
        tools: tools.filter((tool) => tool.messageId === message.id)
      }
    })

    return messagesWithFiles
  }, [conversationId])

  const conversations = useLiveQuery(async () => {
    const conversations = await db.conversations.toArray()

    const conversationsWithLastMessage: ConversationWithLastMessage[] = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await db.messages.where({ conversationId: conversation.id }).last()

        return {
          ...conversation,
          lastMessageAt: lastMessage?.updatedAt
        }
      })
    )

    return conversationsWithLastMessage
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeListener = addMessageListener((message: any) => {
      const { type, payload } = message

      const messageTypes = {
        selectConversation: () => navigator(`/${payload.conversationId}`),
        [ServerEndpoints.setMessageContext]: () => setMessageContext(payload.context)
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]

      if (messageType) {
        logger.info(`[ChatProvider] Received message: ${type}`)
        messageType()
      }
    })

    return () => removeListener()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessageListener, sendPortMessage])

  const sendMessage = useCallback(
    async (message: string, images: Omit<File, 'conversationId' | 'messageId'>[] = []) => {
      const trimmedMessage = message.trim()
      if (!trimmedMessage || !selectedModel?.id) return

      const messageWithContext = messageContext
        ? `Here is the user's context and message. Use the information inside the context tag as background knowledge, and respond based on the user's input inside the message tag. <context>${messageContext.trim()}</context><message>${trimmedMessage}</message>`
        : `Here is the user's message. Respond based on the input inside the message tag. <message>${trimmedMessage}</message>`

      sendPortMessage(ServerEndpoints.sendMessage, {
        conversationId: selectedConversation?.id,
        modelId: selectedModel.id,
        message: messageWithContext,
        files: images,
        tools
      })

      setMessageContext(undefined)
    },
    [selectedModel, sendPortMessage, selectedConversation, setMessageContext, messageContext, tools]
  )

  const selectModel = useCallback(
    (model: string) => {
      const selectedModel = models.find((m) => m.model === model)
      if (selectedModel) {
        setSelectedModel(selectedModel)
      }
    },
    [models]
  )

  const deleteConversation = useCallback(
    async (id?: number) => {
      if (!id) return

      await db.files.where({ conversationId: id }).delete()
      await db.messages.where({ conversationId: id }).delete()
      await db.conversations.delete(id)

      if (selectedConversation?.id === id) {
        navigator('/')
      }

      toast.success('Conversation deleted successfully')
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendPortMessage, selectedConversation]
  )

  const pinConversation = useCallback(
    async (id?: number) => {
      if (!id) return

      await db.conversations.update(id, { pinned: true })

      toast.success(t('pinnedConversation'), {
        position: 'top-center'
      })
    },
    [t]
  )

  const unpinConversation = useCallback(
    async (id?: number) => {
      if (!id) return

      await db.conversations.update(id, { pinned: false })

      toast.success(t('unpinnedConversation'), {
        position: 'top-center'
      })
    },
    [t]
  )

  const modelContextValue = useMemo(
    () => ({
      models,
      selectedModel,
      selectModel
    }),
    [models, selectedModel, selectModel]
  )

  const regenerateResponse = useCallback(() => {
    if (!selectedConversation?.id || !selectedModel?.id) return

    sendPortMessage(ServerEndpoints.regenerateResponse, {
      conversationId: selectedConversation.id,
      modelId: selectedModel.id,
      tools
    })
  }, [sendPortMessage, selectedModel, selectedConversation, tools])

  const continueGenerating = useCallback(() => {
    if (!selectedConversation?.id || !selectedModel?.id) return

    sendPortMessage(ServerEndpoints.continueGenerating, {
      conversationId: selectedConversation?.id,
      modelId: selectedModel.id,
      tools
    })
  }, [selectedConversation, sendPortMessage, selectedModel, tools])

  const stopGenerating = useCallback(() => {
    if (!selectedConversation) return

    sendPortMessage(ServerEndpoints.stop, { conversationId: selectedConversation?.id })
  }, [sendPortMessage, selectedConversation])

  const chatContextValue = useMemo(
    () => ({
      messages,
      sendMessage,
      conversations,
      conversationId,
      deleteConversation,
      pinConversation,
      unpinConversation,
      selectedConversation,
      regenerateResponse,
      stopGenerating,
      continueGenerating,
      messageContext,
      setMessageContext,
      setTools,
      tools
    }),
    [
      messages,
      conversations,
      sendMessage,
      conversationId,
      deleteConversation,
      pinConversation,
      unpinConversation,
      selectedConversation,
      regenerateResponse,
      stopGenerating,
      continueGenerating,
      messageContext,
      setMessageContext,
      setTools,
      tools
    ]
  )

  return (
    <ModelContext.Provider value={modelContextValue}>
      <ChatContext.Provider value={chatContextValue}>{children}</ChatContext.Provider>
    </ModelContext.Provider>
  )
}

export default ChatProvider
