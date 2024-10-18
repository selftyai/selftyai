import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'

export interface ExtendedEvent<T> extends MessageEvent<T> {
  broadcastMessage: (message: MessageEvent<unknown>) => void
  port: chrome.runtime.Port
  getConnectedPorts: () => chrome.runtime.Port[]
}

class PortHandler {
  private connectedPorts!: chrome.runtime.Port[]
  private handler!: AbstractHandler<ExtendedEvent<unknown>, unknown>

  constructor(handler: AbstractHandler<ExtendedEvent<unknown>, unknown>) {
    this.handler = handler
    this.connectedPorts = []

    this.onConnect = this.onConnect.bind(this)
    this.broadcastMessage = this.broadcastMessage.bind(this)
  }

  public onConnect(port: chrome.runtime.Port) {
    console.log('[PortHandler] Port connected:', port)
    this.connectedPorts.push(port)

    port.onDisconnect.addListener(() => this.onDisconnect(port))
    port.onMessage.addListener(this.onMessage.bind(this, port))
  }

  private onDisconnect(port: chrome.runtime.Port) {
    console.log('[PortHandler] Port disconnected:', port)
    const index = this.connectedPorts.indexOf(port)
    if (index > -1) {
      this.connectedPorts.splice(index, 1)
    }
  }

  private async onMessage(port: chrome.runtime.Port, message: MessageEvent<unknown>) {
    let response = null

    try {
      response = await this.handler.handle({
        ...message,
        broadcastMessage: this.broadcastMessage,
        port,
        getConnectedPorts: () => this.connectedPorts
      })
    } catch (error: unknown) {
      console.warn(
        '[PortHandler] Error while handling message:',
        error instanceof Error ? error.message : error
      )
    }

    if (response) {
      try {
        port.postMessage({
          type: message.type,
          response
        })
        console.log('[PortHandler] Response sent:', response)
      } catch (error: unknown) {
        console.warn(
          '[PortHandler] Error while sending response:',
          error instanceof Error ? error.message : error
        )
      }
    }
  }

  private broadcastMessage(message: MessageEvent<unknown>) {
    this.connectedPorts.forEach((port) => {
      port.postMessage(message)
    })
  }
}

export default PortHandler
