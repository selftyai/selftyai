import { Model } from '@/shared/db/models/Model'
import { ConversationWithLastMessage } from '@/sidebar/types/ConversationWithLastMessage'
import { ConversationWithModel } from '@/sidebar/types/ConversationWithModel'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'

export interface ChatState {
  isInitialized: boolean
  isLoading: boolean
  models: Model[]
  selectedModel?: Model
  conversations: ConversationWithLastMessage[]
  selectedConversation?: ConversationWithModel
  messages: MessageWithFiles[]
  context?: string
  tools: string[]
}

export interface ChatActions {
  setModel: (model: Model | undefined) => void
  setTools: (tools: string[]) => void
  setContext: (context: string | undefined) => void
  selectConversation: (conversation: ConversationWithLastMessage | undefined) => Promise<void>
}
