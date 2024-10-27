export interface GroqModelItem {
  id: string
  object: 'model'
  /**
   * Timestamp of when the model was created
   */
  created: number
  owned_by: string
  active: boolean
  context_window: number
}
