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
      selectedModel?: Model
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
      setChatId: (chatId: string | undefined) => void
      chatId?: string
      selectedConversation?: Conversation
      deleteConversation: (id: string) => void
      pinConversation: (id: string) => void
      unpinConversation: (id: string) => void
      hasError: boolean
      regenerateResponse: () => void
      stopGenerating: () => void
      continueGenerating: () => void
      error?: string
      messageContext?: string
      setMessageContext: (context: string | undefined) => void
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
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation>()

  const [chatId, setChatId] = React.useState<string>()
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [selectedModel, setSelectedModel] = React.useState<Model>()
  const [messageContext, setMessageContext] = React.useState<string>()

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeListener = addMessageListener((message: any) => {
      const { type, payload, ...rest } = message

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
            const lastMessage = payload.messages[payload.messages.length - 1]
            setHasError(lastMessage.finishReason === 'error')
            setError(lastMessage.error)
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
        },
        [ServerEndpoints.pinConversation]: () => {
          setConversations(message.conversations)
        },
        [ServerEndpoints.unpinConversation]: () => {
          setConversations(message.conversations)
        },
        [ServerEndpoints.setMessageContext]: () => {
          setMessageContext(message.payload)
        }
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]

      if (messageType) {
        console.log(`[ChatProvider] Received message: ${type} with data`, {
          payload,
          ...rest
        })
        messageType()
      }
    })

    sendPortMessage(ServerEndpoints.getConversations)

    return () => removeListener()
  }, [addMessageListener, sendPortMessage, chatId, setConversations])

  React.useEffect(() => {
    setSelectedConversation(conversations.find((c) => c.id === chatId))
  }, [chatId, conversations])

  useEffect(() => {
    const conversation = conversations.find((c) => c.id === chatId)

    if (conversation) {
      setMessages((prev) => (prev.length === 0 ? conversation.messages : prev))
      const lastMessage = conversation.messages[conversation.messages.length - 1]
      setHasError(lastMessage.finishReason === 'error')
      setError(lastMessage.error)
      setSelectedModel(models.find((m) => m.model === conversation.model))
    } else {
      setHasError(false)
    }
  }, [chatId, conversations, models, messages])

  const sendMessage = useCallback(
    async (message: string, images: string[] = []) => {
      const trimmedMessage = message.trim()
      if (!trimmedMessage || !selectedModel) return

      setIsGenerating(true)

      const messageWithContext = messageContext
        ? `Based on the current context:"${messageContext.trim()}" and user's message: "${trimmedMessage}" generate a response.`
        : trimmedMessage

      const createMessageObject = (content: string) =>
        ({
          role: 'user',
          content: [
            { type: 'text', text: content },
            ...images.map((image) => ({ type: 'image', image }) as ImagePart)
          ]
        }) as CoreMessage

      const messageObject = createMessageObject(trimmedMessage)
      const messageObjectWithContext = createMessageObject(messageWithContext)

      setMessages((prev) => [
        ...prev,
        {
          ...messageObject,
          context: messageContext,
          userMessage: trimmedMessage,
          id: 'temp',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Message
      ])

      sendPortMessage(ServerEndpoints.sendMessage, {
        chatId,
        message: messageObjectWithContext,
        context: messageContext,
        userMessage: trimmedMessage,
        model: {
          provider: selectedModel.provider,
          model: selectedModel.model
        }
      })

      setMessageContext(undefined)
    },
    [chatId, messageContext, selectedModel, sendPortMessage]
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
      setMessages([])
      setChatId(undefined)
    },
    [sendPortMessage]
  )

  const pinConversation = useCallback(
    (id: string) => {
      sendPortMessage(ServerEndpoints.pinConversation, { id })
    },
    [sendPortMessage]
  )

  const unpinConversation = useCallback(
    (id: string) => {
      sendPortMessage(ServerEndpoints.unpinConversation, { id })
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

  const regenerateResponse = useCallback(() => {
    if (!chatId || !selectedModel) return

    sendPortMessage(ServerEndpoints.regenerateResponse, { chatId, model: selectedModel })
    setIsGenerating(true)
  }, [chatId, sendPortMessage, selectedModel])

  const continueGenerating = useCallback(() => {
    if (!chatId || !selectedModel) return

    sendPortMessage(ServerEndpoints.continueGenerating, { chatId, model: selectedModel })
    setIsGenerating(true)
  }, [chatId, sendPortMessage, selectedModel])

  const stopGenerating = useCallback(() => {
    if (!chatId) return

    sendPortMessage(ServerEndpoints.stop, { chatId })
  }, [sendPortMessage, chatId])

  const chatContextValue = useMemo(
    () => ({
      messages,
      sendMessage,
      conversations,
      isGenerating,
      setChatId: changeChatId,
      chatId,
      deleteConversation,
      pinConversation,
      unpinConversation,
      selectedConversation,
      hasError,
      regenerateResponse,
      stopGenerating,
      continueGenerating,
      error,
      messageContext,
      setMessageContext
    }),
    [
      messages,
      conversations,
      sendMessage,
      isGenerating,
      chatId,
      deleteConversation,
      changeChatId,
      pinConversation,
      unpinConversation,
      selectedConversation,
      hasError,
      regenerateResponse,
      stopGenerating,
      continueGenerating,
      error,
      messageContext,
      setMessageContext
    ]
  )

  return (
    <ModelContext.Provider value={modelContextValue}>
      <ChatContext.Provider value={chatContextValue}>{children}</ChatContext.Provider>
    </ModelContext.Provider>
  )
}

export default ChatProvider
