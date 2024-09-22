type OllamaModelDetails = {
  parent_model: string
  format: string
  family: string
  families: string[]
  parameter_size: string
  quantization_level: string
}

export type OllamaModel = {
  name: string
  model: string
  modified_at: Date
  size: number
  digest: string
  details: OllamaModelDetails
}

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
