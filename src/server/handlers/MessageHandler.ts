import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { MessageEvent } from '@/server/types/MessageEvent'

class MessageHandler {
  private handler!: AbstractHandler<MessageEvent<unknown>, unknown>

  constructor(handler: AbstractHandler<MessageEvent<unknown>, unknown>) {
    this.handler = handler

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
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) {
    const { type, payload } = message

    console.log(
      `[${sender.id}][Message Handler] Received message with type: ${type} and payload`,
      payload
    )
    const handler = this.wrapAsyncHandler(this.handler)
    handler(message).then((payload: unknown) => {
      console.log(
        `[${sender.id}][Message Handler] Sending response for message type: ${type}`,
        payload
      )
      sendResponse(payload)
    })

    return true // Indicates that the response will be sent asynchronously
  }
}

export default MessageHandler
