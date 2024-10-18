import { TimestampedEntity } from '@/shared/db/models'

export interface Conversation extends TimestampedEntity {
  id?: number
  title: string
  modelId: number
  systemMessage?: string
  pinned?: boolean
  generating?: boolean
}
