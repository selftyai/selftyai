/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react-refresh/only-export-components */
import { CoreMessage, ImagePart, streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider'
import React, { useEffect, useMemo } from 'react'

import { useOllama } from '@/providers/OllamaProvider'
import OllamaService from '@/services/ollama/OllamaService'
import { Model } from '@/services/types/Model'
import { processChatStream } from '@/utils/stream'
import { Conversation, Message } from '@/workers/types'

interface ChatContextType {
  messages: CoreMessage[]
  sendMessage: (message: string, images: string[]) => Promise<void>
  models: Model[]
  selectedModel: Model | 'Select model'
  selectModel: (model: string) => void
  isGenerating: boolean
  error: string

  conversations: Conversation[]
  setChatId: (chatId: string | undefined) => void
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
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [messages, setMessages] = React.useState<Message[]>([])

  const chatPort = useMemo(() => {
    const chromePort = chrome.runtime.connect({ name: 'chat' })

    chromePort.onMessage.addListener((message) => {
      const types = {
        getConversations: () => {
          setConversations(message.conversations)
        },
        createConversation: () => {
          setConversations((prev) => [...prev, message.conversation])
        }
      }

      const type = types[message.type as keyof typeof types]

      if (type) {
        type()
      }
    })

    return chromePort
  }, [])

  useEffect(() => {
    chatPort.postMessage({ type: 'getConversations' })

    return () => {
      chatPort.disconnect()
    }
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
    setMessages(messages)
  }, [chatId])

  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState('')
  const [selectedModel, setSelectedModel] = React.useState<Model | 'Select model'>('Select model')

  const sendMessage = async (message: string, images: string[] = []) => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || typeof selectedModel === 'string') return

    // const conversation = await getOrCreateConversation()

    try {
      setIsGenerating(true)

      // port.postMessage({
      //   type: 'sendMessage',
      //   conversation,
      //   content: {
      //     role: 'user',
      //     content: [
      //       {
      //         type: 'text',
      //         text: trimmedMessage
      //       },
      //       ...images.map(
      //         (image) =>
      //           ({
      //             type: 'image',
      //             image: image
      //           }) satisfies ImagePart
      //       )
      //     ]
      //   }
      // })

      const ollamaRest = OllamaService.getInstance()

      const ollama = createOllama({
        baseURL: `${await ollamaRest.getBaseURL()}/api`
      })

      const responseMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const newMessages = [
        ...messages,
        {
          id: crypto.randomUUID(),
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
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        responseMessage
      ] as Message[]
      setMessages(newMessages)

      chatPort.postMessage({
        type: 'createConversation',
        conversation: {
          title: 'New conversation',
          messages: newMessages,
          model: selectedModel.model,
          provider: selectedModel.provider,
          systemMessage: 'You are a helpful assistant.'
        }
      })

      const result = await streamText({
        model: ollama(selectedModel.model),
        system: 'You are a helpful assistant.',
        messages: [
          ...messages,
          {
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
          }
        ]
      })

      processChatStream(
        result.toDataStream(),
        (data) => {
          const formatted = data.split(':')

          if (formatted[0] === '0') {
            responseMessage.content += formatted[1].substring(1, formatted[1].length - 2)

            setMessages((prev) => [...prev.slice(0, prev.length - 1), responseMessage])
          }
        },
        () => {
          setIsGenerating(false)
        }
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: error.message,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      setIsGenerating(false)
    }
  }

  const selectModel = (model: string) => {
    const selectedModel = models.find((m) => m.model === model)

    if (selectedModel) {
      setSelectedModel(selectedModel)
    }
  }

  const value = {
    messages,
    sendMessage,
    models,
    selectedModel,
    selectModel,
    isGenerating,
    error,

    conversations,
    setChatId
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export default ChatProvider
