import { TimestampedEntity } from '@/shared/db/models'

export interface Integration extends TimestampedEntity {
  id?: number
  name: string
  active: boolean
  apiKey?: string
  baseURL: string
}
