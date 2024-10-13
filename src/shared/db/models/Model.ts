import { TimestampedEntity } from '@/shared/db/models'

export interface Model extends TimestampedEntity {
  id?: number
  name: string
  model: string
  provider: string
  isDeleted?: boolean
  vision?: boolean
}
