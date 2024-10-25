import { File } from '@/shared/db/models/File'
import { Message } from '@/shared/db/models/Message'
import { ToolInvocation } from '@/shared/db/models/ToolInvocation'

export interface MessageWithFiles extends Message {
  files: File[]
  tools: ToolInvocation[]
}
