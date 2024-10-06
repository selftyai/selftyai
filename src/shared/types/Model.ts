import { AIProvider } from '@/shared/types/AIProvider'

export type Model = {
  name: string
  model: string
  provider: AIProvider
  hasVision?: boolean
}
