import { AbstractHandler } from '@/server/handlers/AbstractHandler'
import { ExtendedEvent } from '@/server/handlers/PortHandler'

export default function mergeHandlers(
  ...handlers: AbstractHandler<ExtendedEvent<unknown>, unknown>[]
) {
  const [firstHandler, ...restHandlers] = handlers

  restHandlers.reduce((prev, curr) => {
    prev.setNext(curr)
    return curr
  }, firstHandler)

  return firstHandler
}
