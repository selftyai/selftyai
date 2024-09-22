import type { Model } from '@/services/types/Model'

abstract class AIService {
  /**
   * Verify the connection to the AI service
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise
   */
  abstract verifyConnection(): Promise<boolean>

  /**
   * Get the models available for the AI service
   * @returns {Promise<Model[]>} The models available for the AI service
   */
  abstract getModels(): Promise<Model[]>

  /**
   * Set the base URL for the AI service
   * @param baseURL {string} The base URL for the AI service
   * @returns {Promise<boolean>} True if the base URL is set successfully, false otherwise
   */
  abstract setBaseURL(baseURL: string): Promise<boolean>
  /**
   * Get the base URL for the AI service
   * @returns {Promise<string>} The base URL for the AI service
   */
  abstract getBaseURL(): Promise<string>
}

export default AIService
