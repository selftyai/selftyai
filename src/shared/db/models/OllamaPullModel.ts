import { TimestampedEntity } from '@/shared/db/models'

export interface OllamaPullModel extends TimestampedEntity {
  id?: number
  modelTag: string
  status: string
}
