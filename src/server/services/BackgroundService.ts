import { createHandlerChains, createMessageHandlerChain } from '@/server/handlers'
import MessageHandler from '@/server/handlers/MessageHandler'
import PortHandler from '@/server/handlers/PortHandler'
import checkOngoingPullModels from '@/server/utils/ollama/checkOngoingPullModels'
import monitorPullingModels from '@/server/utils/ollama/monitorPullingModels'
import { db } from '@/shared/db'
import { Conversation } from '@/shared/db/models/Conversation'
import printBuildInfo from '@/shared/printBuildInfo'

class BackgroundService {
  private portHandler: PortHandler
  private messageHandler: MessageHandler
  private modelMonitoringInterval: NodeJS.Timeout | null = null

  constructor() {
    this.portHandler = new PortHandler(createHandlerChains())
    this.messageHandler = new MessageHandler(createMessageHandlerChain())
  }

  start() {
    printBuildInfo()
    this.setupSidePanel()
    this.initializeDatabase()
    this.startModelMonitoring()
    this.registerListeners()
  }

  stop() {
    this.stopModelMonitoring()
    this.unregisterListeners()
  }

  private setupSidePanel() {
    chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true })
  }

  private initializeDatabase() {
    db.conversations.toArray().then((conversations) => {
      const ongoingConversations = conversations.filter((conversation) => conversation.generating)
      this.abortOngoingConversations(ongoingConversations)
    })
  }

  private async abortOngoingConversations(ongoingConversations: Conversation[]) {
    for (const conversation of ongoingConversations) {
      const message = await db.messages.where({ conversationId: conversation.id }).last()
      if (!message?.id || !conversation?.id) continue

      await db.messages.update(message.id, {
        error: 'AbortedError',
        finishReason: 'aborted'
      })

      await db.conversations.update(conversation.id, {
        generating: false
      })
    }
  }

  private startModelMonitoring() {
    monitorPullingModels()
    this.modelMonitoringInterval = setInterval(monitorPullingModels, 1000 * 5)
    checkOngoingPullModels()
  }

  private stopModelMonitoring() {
    if (this.modelMonitoringInterval) {
      clearInterval(this.modelMonitoringInterval)
      this.modelMonitoringInterval = null
    }
  }

  private registerListeners() {
    chrome.runtime.onConnect.addListener(this.portHandler.onConnect)
    chrome.runtime.onMessage.addListener(this.messageHandler.onMessage)
  }

  private unregisterListeners() {
    chrome.runtime.onConnect.removeListener(this.portHandler.onConnect)
    chrome.runtime.onMessage.removeListener(this.messageHandler.onMessage)
  }
}

export default BackgroundService
