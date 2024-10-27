import axios from 'axios'

import { BaseService } from '@/server/services/BaseService'
import { Model } from '@/shared/db/models/Model'
import { Integrations } from '@/shared/types/Integrations'
import { GroqModelItem } from '@/shared/types/groq/GroqModelItem'

export class GroqService extends BaseService {
  private static instance: GroqService | null = null

  private constructor() {
    super()
  }

  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService()
    }

    return GroqService.instance
  }

  /**
   * Verify the connection to the Groq service
   * @param url In this case, it's API key
   * @returns True if the connection is successful, false otherwise
   * @throws {Error} If the connection is not successful
   */
  public async verifyConnection(url?: string): Promise<boolean> {
    const urlToVerify = url || this.baseURL

    try {
      await axios.get('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${urlToVerify}`
        }
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('invalidApiKey')
      }

      throw error
    }

    return true
  }

  /**
   * Get the models available for the Groq service
   * @returns {Promise<Model[]>} The models available for the Groq service
   */
  public async getModels(): Promise<Model[]> {
    try {
      const { data } = await axios.get('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${this.baseURL}`
        }
      })

      const { data: models } = data as { data: GroqModelItem[] }

      const filteredModels = models.filter((model) => !model.id.includes('whisper'))

      return filteredModels.map(
        (model) =>
          ({
            name: model.id,
            // Langchain doesn't support the vision model yet
            vision: false,
            supportTool: true,
            model: model.id,
            provider: Integrations.groq
          }) as Model
      )
    } catch {
      return []
    }
  }
}
