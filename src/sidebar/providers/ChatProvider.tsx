/* eslint-disable react-refresh/only-export-components */
import { useLiveQuery } from 'dexie-react-hooks'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { db } from '@/shared/db'
import { File } from '@/shared/db/models/File'
import type { Model } from '@/shared/db/models/Model'
import { SettingsKeys } from '@/shared/db/models/SettingsItem'
import logger from '@/shared/logger'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { defaultPrompts } from '@/sidebar/constants/chat'
import { useChromePort } from '@/sidebar/hooks/useChromePort'
// import { useOllama } from '@/sidebar/providers/OllamaProvider'
import { useChatStore } from '@/sidebar/stores/chatStore'
import { ConversationWithLastMessage } from '@/sidebar/types/ConversationWithLastMessage'
import { ConversationWithModel } from '@/sidebar/types/ConversationWithModel'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'
import deleteConversationWithRelations from '@/sidebar/utils/chat/deleteConversation'
import getConversations from '@/sidebar/utils/chat/getConversations'
import getMessagesByConversationId from '@/sidebar/utils/chat/getMessagesByConversationId'
import { getFullPrompt } from '@/sidebar/utils/parseMessage'

import { useOllama } from './OllamaProvider'

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
      conversations: ConversationWithLastMessage[]
      selectedConversation?: ConversationWithModel
      messages: MessageWithFiles[]
      messageContext?: string
      tools: string[]
      sendMessage: (
        message: string,
        images: Omit<File, 'conversationId' | 'messageId'>[]
      ) => Promise<void>
      deleteConversation: (id?: number) => Promise<void>
      pinConversation: (id?: number) => Promise<void>
      unpinConversation: (id?: number) => Promise<void>
      regenerateResponse: (messageId: number) => void
      stopGenerating: () => void
      continueGenerating: (messageId: number) => void
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

  const { conversationId } = useParams()
  const navigator = useNavigate()
  const { t } = useTranslation()

  const { models: ollamaModels } = useOllama()
  const {
    models: allModels,
    selectedModel,
    context,
    tools,
    setModel,
    setContext,
    setTools
  } = useChatStore()

  const models = useMemo(() => [...(ollamaModels ?? []), ...allModels], [ollamaModels, allModels])

  const selectedConversation = useLiveQuery(async () => {
    if (!conversationId) return undefined

    const conversation = await db.conversations.where({ id: Number(conversationId) }).first()

    if (!conversation) {
      navigator('/')
      return undefined
    }

    const model = await db.models.get(conversation.modelId)
    setModel(model)

    return { ...conversation, model }
  }, [conversationId])

  const conversationsQuery = useLiveQuery(getConversations, [])
  const conversations = useMemo(() => conversationsQuery ?? [], [conversationsQuery])

  const messagesQuery = useLiveQuery(
    async () => getMessagesByConversationId(selectedConversation?.id ?? -1),
    [selectedConversation]
  )
  const messages = useMemo(() => messagesQuery ?? [], [messagesQuery])

  const settingsQuery = useLiveQuery(async () => {
    const settings = await db.settings
      .where('key')
      .anyOf([
        SettingsKeys.customPromptWithContext,
        SettingsKeys.customPromptWithoutContext,
        SettingsKeys.defaultModel,
        SettingsKeys.isContextInPromptEnabled
      ])
      .toArray()

    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    )
  }, [])
  const settings = useMemo(() => settingsQuery ?? {}, [settingsQuery])

  React.useEffect(() => {
    if (settings?.defaultModel && !selectedConversation) {
      setModel(selectedModel ?? models.find((m) => m.model === settings?.defaultModel))
    }
  }, [settings, selectedModel, models, selectedConversation, setModel])

  React.useEffect(() => {
    const removeListener = addMessageListener((message) => {
      const { type, payload } = message

      const messageTypes = {
        selectConversation: () => navigator(`/${payload.conversationId}`),
        [ServerEndpoints.setMessageContext]: () => setContext(payload.context)
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
      if (!trimmedMessage || !selectedModel || !selectedModel.id) return

      const branchRecord = selectedConversation
        ? await db.branches.where({ conversationId: selectedConversation.id! }).first()
        : undefined

      const getPrompt = (): string => {
        const promptTemplate =
          settings?.isContextEnabled === 'true' && context
            ? settings?.customPromptWithContext || defaultPrompts.withContext
            : settings?.customPromptWithoutContext || defaultPrompts.withoutContext

        return getFullPrompt(promptTemplate, trimmedMessage, context?.trim() ?? '')
      }

      const prompt = getPrompt()

      sendPortMessage(ServerEndpoints.sendMessage, {
        conversationId: selectedConversation?.id,
        modelId: selectedModel.id,
        message: prompt,
        files: images,
        tools,
        parentMessageId: branchRecord?.branchPath[branchRecord?.branchPath.length - 1]
      })

      setContext(undefined)
    },
    [selectedModel, sendPortMessage, selectedConversation, context, setContext, tools, settings]
  )

  const selectModel = useCallback(
    (model: string) => {
      const newSelectedModel = models.find((m) => m.model === model)

      setModel(newSelectedModel === selectedModel ? undefined : newSelectedModel)
    },
    [models, selectedModel, setModel]
  )

  const deleteConversation = useCallback(
    async (id?: number) => {
      if (!id) return

      await deleteConversationWithRelations(id)

      toast.success(t('deletedConversation'), {
        position: 'top-center'
      })
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

  const regenerateResponse = useCallback(
    (messageId: number) => {
      if (!selectedConversation?.id || !selectedModel?.id) return

      sendPortMessage(ServerEndpoints.regenerateResponse, {
        conversationId: selectedConversation.id,
        modelId: selectedModel.id,
        tools,
        messageId
      })
    },
    [sendPortMessage, selectedModel, selectedConversation, tools]
  )

  const continueGenerating = useCallback(
    (messageId: number) => {
      if (!selectedConversation?.id || !selectedModel?.id) return

      sendPortMessage(ServerEndpoints.continueGenerating, {
        conversationId: selectedConversation?.id,
        modelId: selectedModel.id,
        tools,
        messageId
      })
    },
    [selectedConversation, sendPortMessage, selectedModel, tools]
  )

  const stopGenerating = useCallback(() => {
    if (!selectedConversation) return

    sendPortMessage(ServerEndpoints.stop, { conversationId: selectedConversation?.id })
  }, [sendPortMessage, selectedConversation])

  const chatContextValue = useMemo(
    () => ({
      messages,
      sendMessage,
      conversations,
      deleteConversation,
      pinConversation,
      unpinConversation,
      selectedConversation,
      regenerateResponse,
      stopGenerating,
      continueGenerating,
      messageContext: context,
      setMessageContext: setContext,
      setTools,
      tools
    }),
    [
      messages,
      conversations,
      sendMessage,
      deleteConversation,
      pinConversation,
      unpinConversation,
      selectedConversation,
      regenerateResponse,
      stopGenerating,
      continueGenerating,
      context,
      setContext,
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
