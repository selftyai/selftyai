import { Conversation } from '@/shared/db/models/Conversation'
import { Model } from '@/shared/db/models/Model'

export interface ConversationWithModel extends Conversation {
  model?: Model
}
