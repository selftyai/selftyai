import { Conversation } from '@/shared/db/models/Conversation'

export interface ConversationWithLastMessage extends Conversation {
  lastMessageAt?: Date
}
