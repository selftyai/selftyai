import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import logger from '@/shared/logger'

class MessageHandler {
  private handler!: AbstractHandler<MessageEvent<unknown>, unknown>
  private wrappedHandler: (message: MessageEvent<unknown>) => Promise<unknown>

  constructor(handler: AbstractHandler<MessageEvent<unknown>, unknown>) {
    this.handler = handler
    this.wrappedHandler = this.wrapAsyncHandler(this.handler)
    this.onMessage = this.onMessage.bind(this)
  }

  private wrapAsyncHandler(handler: AbstractHandler<MessageEvent<unknown>, unknown>) {
    return async (message: MessageEvent<unknown>) => {
      let response = null

      try {
        response = await handler.handle(message)
      } catch (error: unknown) {
        console.warn(
          '[MessageHandler] Error while handling message:',
          error instanceof Error ? error.message : error
        )
      }

      return response
    }
  }

  public onMessage(
    message: MessageEvent<unknown>,
    _: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) {
    const { type, payload } = message

    logger.info(`[MessageHandler] Received message with type: ${type} and payload`, payload)

    this.wrappedHandler(message).then((payload: unknown) => {
      logger.info(`[MessageHandler] Sending response for message type: ${type}`, payload)
      sendResponse(payload)
    })

    return true // Indicates that the response will be sent asynchronously
  }
}

export default MessageHandler
