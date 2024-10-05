import type { OllamaModelDetails } from '@/server/types/ollama/OllamaModelDetails'

type OllamaProjectorInfo = {
  'clip.has_vision_encoder': boolean
}

export type ShowOllamaModel = {
  modelfile: string
  parameters: string
  template: Date
  details: OllamaModelDetails
  projector_info?: OllamaProjectorInfo
  name?: string
}
