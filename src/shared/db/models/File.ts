import { TimestampedEntity } from '@/shared/db/models'

export interface File extends TimestampedEntity {
  id?: number
  name: string
  type: 'image'
  data: string
  messageId: number
  conversationId: number
}
