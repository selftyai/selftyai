import { TimestampedEntity } from '@/shared/db/models'

export interface ToolInvocation extends TimestampedEntity {
  id?: number
  messageId: number
  toolName: string
  subName: string
  runId: string
  input: string
  output: string
  status: 'loading' | 'success' | 'error'
  error: string
}
