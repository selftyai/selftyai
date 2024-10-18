import { AbstractHandler } from '@/server/handlers/AbstractHandler'

export default function mergeHandlers<T>(...handlers: AbstractHandler<T, unknown>[]) {
  const [firstHandler, ...restHandlers] = handlers

  restHandlers.reduce((prev, curr) => {
    prev.setNext(curr)
    return curr
  }, firstHandler)

  return firstHandler
}
