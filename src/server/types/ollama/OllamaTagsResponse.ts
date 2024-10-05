import type { OllamaModel } from '@/server/types/ollama/OllamaModel'

export interface OllamaTagsResponse {
  models: OllamaModel[]
}
