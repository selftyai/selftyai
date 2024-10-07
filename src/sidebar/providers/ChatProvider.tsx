/* eslint-disable react-refresh/only-export-components */
import { CoreMessage, ImagePart } from 'ai'
import React, { useCallback, useEffect, useMemo } from 'react'

import type { Conversation } from '@/shared/types/Conversation'
import type { Message } from '@/shared/types/Message'
import type { Model } from '@/shared/types/Model'
import { ServerEndpoints } from '@/shared/types/ServerEndpoints'
import { useChromePort } from '@/sidebar/hooks/useChromePort'
import { useOllama } from '@/sidebar/providers/OllamaProvider'

const ModelContext = React.createContext<
  | {
      models: Model[]
      selectedModel: Model | 'Select model'
      selectModel: (model: string) => void
    }
  | undefined
>(undefined)

const ChatContext = React.createContext<
  | {
      messages: Message[]
      conversations: Conversation[]
      sendMessage: (message: string, images: string[]) => Promise<void>
      isGenerating: boolean
      error: string
      setChatId: (chatId: string | undefined) => void
      chatId?: string
      deleteConversation: (id: string) => void
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

  const { models: ollamaModels } = useOllama()

  const models = useMemo<Model[]>(() => {
    return ollamaModels
  }, [ollamaModels])

  const [conversations, setConversations] = React.useState<Conversation[]>([])

  const [chatId, setChatId] = React.useState<string>()
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [error] = React.useState('')
  const [selectedModel, setSelectedModel] = React.useState<Model | 'Select model'>('Select model')

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeListener = addMessageListener((message: any) => {
      const { type, payload } = message

      console.log(`(ChatProvider) Received message: ${type}`)

      const messageTypes = {
        getConversations: () => setConversations(message.conversations),
        selectConversation: () => {
          setConversations(message.conversations)
          setChatId(message.conversationId)
          setMessages(message.messages)
        },
        partialMessage: () => {
          if (payload.chatId === chatId) {
            setMessages(payload.messages)
          }
        },
        finalMessage: () => {
          setConversations(payload.conversations)
          if (payload.chatId === chatId) {
            setIsGenerating(false)
          }
        },
        deleteConversation: () => {
          setConversations(message.conversations)
          if (chatId === payload.id) {
            setChatId(undefined)
            setMessages([])
          }
        }
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]
      if (messageType) messageType()
    })

    sendPortMessage(ServerEndpoints.getConversations)

    return () => removeListener()
  }, [addMessageListener, sendPortMessage, chatId, setConversations])

  React.useEffect(() => {
    console.log('chatId changed:', chatId)
  }, [chatId])

  useEffect(() => {
    const conversation = conversations.find((c) => c.id === chatId)

    if (conversation) {
      setMessages((prev) => (prev.length === 0 ? conversation.messages : prev))
      setSelectedModel(models.find((m) => m.model === conversation.model) || 'Select model')
    }
  }, [chatId, conversations, models, messages])

  const sendMessage = useCallback(
    async (message: string, images: string[] = []) => {
      const trimmedMessage = message.trim()
      if (!trimmedMessage || typeof selectedModel === 'string') return

      setIsGenerating(true)

      const messageObject = {
        role: 'user',
        content: [
          { type: 'text', text: trimmedMessage },
          ...images.map((image) => ({ type: 'image', image }) as ImagePart)
        ]
      } as CoreMessage

      setMessages((prev) => [
        ...prev,
        {
          ...messageObject,
          id: 'temp',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Message
      ])

      sendPortMessage(ServerEndpoints.sendMessage, {
        chatId,
        message: messageObject,
        model: {
          provider: selectedModel.provider,
          model: selectedModel.model
        }
      })
    },
    [chatId, selectedModel, sendPortMessage]
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
    (id: string) => {
      sendPortMessage(ServerEndpoints.deleteConversation, { id })
    },
    [sendPortMessage]
  )

  const modelContextValue = useMemo(
    () => ({
      models,
      selectedModel,
      selectModel
    }),
    [models, selectedModel, selectModel]
  )

  const changeChatId = useCallback(
    (newChatId: string | undefined) => {
      setChatId(newChatId)
      setMessages([])
      setIsGenerating(false)
    },
    [setChatId]
  )

  const chatContextValue = useMemo(
    () => ({
      messages,
      sendMessage,
      conversations,
      isGenerating,
      error,
      setChatId: changeChatId,
      chatId,
      deleteConversation
    }),
    [
      messages,
      conversations,
      sendMessage,
      isGenerating,
      error,
      chatId,
      deleteConversation,
      changeChatId
    ]
  )

  return (
    <ModelContext.Provider value={modelContextValue}>
      <ChatContext.Provider value={chatContextValue}>{children}</ChatContext.Provider>
    </ModelContext.Provider>
  )
}

export default ChatProvider
