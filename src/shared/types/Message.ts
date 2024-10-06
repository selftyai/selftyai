import { CoreMessage } from 'ai'

export type Message = CoreMessage & {
  id: string
  createdAt: Date
  updatedAt: Date
}
