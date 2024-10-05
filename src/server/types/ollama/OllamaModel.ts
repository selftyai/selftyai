import type { OllamaModelDetails } from '@/server/types/ollama/OllamaModelDetails'

export type OllamaModel = {
  name: string
  model: string
  modified_at: Date
  size: number
  digest: string
  details: OllamaModelDetails
}
