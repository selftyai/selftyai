import { TimestampedEntity } from '@/shared/db/models'

export interface Model extends TimestampedEntity {
  id?: number
  name: string
  model: string
  provider: string
  isDeleted?: boolean
  /**
   * Whether this model has vision capabilities.
   */
  vision?: boolean
  /**
   * Whether this model is a support tool invocation.
   */
  supportTool?: boolean
}
