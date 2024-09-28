import { CoreMessage } from 'ai'
import { streamText } from 'ai'
import { createOllama } from 'ollama-ai-provider'
import { StateStorage } from 'zustand/middleware'

import OllamaService from '@/services/ollama/OllamaService'
import { AIProvider } from '@/types/AIProvider'
import type { Conversation } from '@/types/Conversation'
import { Message } from '@/types/Message'
import { createChromeStorage } from '@/utils/storage'
import { processChatStream } from '@/utils/stream'

export class ChatService {
  private static instance: ChatService | null = null
  private storage: StateStorage

  constructor() {
    this.storage = createChromeStorage('local')
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  public async getConversations(): Promise<Conversation[]> {
    const data = await this.storage.getItem('chat-conversations')

    return JSON.parse(data ?? '[]')
  }

  public async createConversation(
    conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'messages'>
  ): Promise<Conversation> {
    const conversations = await this.getConversations()

    const newConversation = {
      ...conversation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    }

    conversations.push(newConversation)

    await this.storage.setItem('chat-conversations', JSON.stringify(conversations))

    return newConversation
  }

  public async updateConversation(conversation: Conversation): Promise<void> {
    const conversations = await this.getConversations()

    const index = conversations.findIndex((c) => c.id === conversation.id)

    conversations[index] = conversation

    await this.storage.setItem('chat-conversations', JSON.stringify(conversations))
  }

  private async getProvider(provider: AIProvider) {
    switch (provider) {
      case AIProvider.ollama: {
        const ollamaService = OllamaService.getInstance()

        return createOllama({
          baseURL: `${await ollamaService.getBaseURL()}/api`
        })
      }
    }
  }

  public async sendMessage(
    conversationId: string,
    message: CoreMessage,
    port: chrome.runtime.Port
  ): Promise<void> {
    const conversations = await this.getConversations()

    const index = conversations.findIndex((c) => c.id === conversationId)
    const conversation = conversations[index]

    const messageToSendSave = {
      id: crypto.randomUUID(),
      ...message,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Message

    conversations[index].messages.push(messageToSendSave)

    const provider = await this.getProvider(conversation.provider)

    const result = await streamText({
      model: provider(conversation.model),
      system: conversation.systemMessage,
      messages: conversations[index].messages
    })

    const responseMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Message
    conversations[index].messages.push(responseMessage)

    await this.storage.setItem('chat-conversations', JSON.stringify(conversations))

    processChatStream(
      result.toDataStream(),
      async (data) => {
        const formatted = data.split(':')

        if (formatted[0] === '0') {
          responseMessage.content += formatted[1].substring(1, formatted[1].length - 2)

          conversations[index].messages[conversations[index].messages.length - 1] = responseMessage
          await this.storage.setItem('chat-conversations', JSON.stringify(conversations))

          try {
            port.postMessage({
              type: 'partialMessage',
              payload: {
                chatId: conversation.id,
                messages: conversations[index].messages
              }
            })
          } catch (error) {
            console.error('Error sending partial message', error)
          }
        }
      },
      async () => {
        port.postMessage({
          type: 'finalMessage',
          payload: {
            chatId: conversation.id,
            conversations: await this.getConversations()
          }
        })
      }
    )
  }

  public async deleteConversation(id: string): Promise<void> {
    const conversations = await this.getConversations()

    const index = conversations.findIndex((c) => c.id === id)

    conversations.splice(index, 1)

    await this.storage.setItem('chat-conversations', JSON.stringify(conversations))
  }
}
