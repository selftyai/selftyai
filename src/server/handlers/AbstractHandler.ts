interface Handler<Request = MessageEvent<unknown>, Result = unknown> {
  setNext(handler: Handler<Request, Result>): Handler<Request, Result>
  handle(request: Request): Result
}

export abstract class AbstractHandler<Request, Result> implements Handler<Request, Result> {
  private nextHandler!: Handler<Request, Result>

  public setNext(handler: Handler<Request, Result>): Handler<Request, Result> {
    this.nextHandler = handler
    return handler
  }

  public handle(request: Request): Result {
    if (this.nextHandler) {
      return this.nextHandler.handle(request)
    }

    throw new Error('[AbstractHandler] No handler found for request')
  }
}
