import { File } from '@/shared/db/models/File'
import { Message } from '@/shared/db/models/Message'

export interface MessageWithFiles extends Message {
  files: File[]
}
