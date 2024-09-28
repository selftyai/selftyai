import { CoreMessage, ImagePart } from 'ai'
import React, { useEffect, useMemo } from 'react'

import { useOllama } from '@/providers/OllamaProvider'
import { Model } from '@/services/types/Model'
import { useChatStore } from '@/stores/chatStore'
import type { Conversation } from '@/types/Conversation'
import type { Message } from '@/types/Message'

interface ChatContextType {
  models: Model[]
  selectedModel: Model | 'Select model'
  selectModel: (model: string) => void
  error: string
  sendMessage: (message: string, images: string[]) => Promise<void>
  messages: CoreMessage[]
  conversations: Conversation[]
  setChatId: (chatId: string | undefined) => void
  isGenerating: boolean
  deleteConversation: (id: string) => void
  chatId?: string
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = React.useContext(ChatContext)

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return context
}

interface ChatProviderProps {
  children: React.ReactNode
}

const ChatProvider = ({ children }: ChatProviderProps) => {
  const { models } = useOllama()

  const [chatId, setChatId] = React.useState<string>()

  const port = useMemo(() => {
    const chromePort = chrome.runtime.connect()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (message: any) => {
      const { type, payload } = message

      const messageTypes = {
        getConversations: () => setConversations(message.conversations),
        selectConversation: () => {
          setConversations(message.conversations)
          setChatId(message.conversation.id)
        },
        partialMessage: () => {
          const conversation = conversations.find((c) => c.id === payload.chatId)

          if (conversation?.id === chatId) {
            setMessages(payload.messages)
          }
        },
        finalMessage: () => {
          const conversation = conversations.find((c) => c.id === payload.chatId)
          setConversations(payload.conversations)

          if (conversation?.id === chatId) {
            setIsGenerating(false)
          }
        },
        deleteConversation: () => {
          setConversations(message.conversations)

          if (chatId === payload.id) {
            setChatId(undefined)
          }
        }
      }

      const messageType = messageTypes[type as keyof typeof messageTypes]

      if (!messageType) {
        return
      }

      messageType()
    }

    chromePort.onMessage.addListener(handleMessage)

    return chromePort
  }, [chatId])

  const [messages, setMessages] = React.useState<Message[]>([])
  const [error] = React.useState('')
  const [selectedModel, setSelectedModel] = React.useState<Model | 'Select model'>('Select model')

  const { conversations, setConversations, isGenerating, setIsGenerating } = useChatStore()

  useEffect(() => {
    port.postMessage({ type: 'getConversations' })
  }, [])

  useEffect(() => {
    if (!chatId) {
      setMessages([])
      return
    }

    const conversation = conversations.find((c) => c.id === chatId)

    if (!conversation) {
      setMessages([])
      return
    }

    const { messages, model } = conversation

    const selectedModel = models.find((m) => m.model === model)

    setSelectedModel(selectedModel || 'Select model')
    setMessages((prev) => (!messages.length ? prev : messages))
  }, [chatId])

  const sendMessage = async (message: string, images: string[] = []) => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || typeof selectedModel === 'string') return

    setIsGenerating(true)

    const messageObject = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: trimmedMessage
        },
        ...images.map(
          (image) =>
            ({
              type: 'image',
              image: image
            }) satisfies ImagePart
        )
      ]
    } as CoreMessage

    setMessages([
      {
        ...messageObject,
        id: 'temp',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Message
    ])

    port.postMessage({
      type: 'sendMessage',
      payload: {
        chatId,
        message: messageObject,
        model: {
          provider: selectedModel.provider,
          model: selectedModel.model
        }
      }
    })
  }

  const selectModel = (model: string) => {
    const selectedModel = models.find((m) => m.model === model)

    if (selectedModel) {
      setSelectedModel(selectedModel)
    }
  }

  const deleteConversation = async (id: string) => {
    port.postMessage({
      type: 'deleteConversation',
      payload: {
        id
      }
    })
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        models,
        selectedModel,
        selectModel,
        isGenerating,
        error,
        conversations,
        setChatId: (chatId) => {
          setIsGenerating(false)
          setChatId(chatId)
        },
        chatId,
        deleteConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export default ChatProvider
