import axios from 'axios'

import { BaseService } from '@/server/services/BaseService'
import type { OllamaTagsResponse } from '@/server/types/ollama/OllamaTagsResponse'
import type { ShowOllamaModel } from '@/server/types/ollama/ShowOllamaModel'
import { AIProvider } from '@/types/AIProvider'
import type { Model } from '@/types/Model'

export class OllamaService extends BaseService {
  private static instance: OllamaService | null = null
  private ollamaText = 'Ollama is running'

  private constructor() {
    super()
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService()
    }

    return OllamaService.instance
  }

  /**
   * Verify the origin of the Ollama service
   * @param url The base URL for the Ollama service. If not provided, the base URL set in the service will be used.
   * @returns True if the origin is valid, false otherwise
   */
  private async verifyOllamaOrigin(baseURL: string): Promise<boolean> {
    try {
      await axios.post(`${baseURL}/api/show`, {
        name: ''
      })

      throw new Error('Unexpected error while verifying Ollama origin')
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          return false
        }

        return true
      }

      console.error('Error while verifying Ollama origin', error)
      return false
    }
  }

  /**
   * Verify the connection to the Ollama service
   * @param url The base URL for the Ollama service. If not provided, the base URL set in the service will be used.
   * @returns True if the connection is successful, false otherwise
   * @throws {Error} If the connection is not successful
   */
  public async verifyConnection(url?: string): Promise<boolean> {
    const urlToVerify = url || this.baseURL

    try {
      const response = await axios.get(urlToVerify)

      if (response.data !== this.ollamaText) {
        throw new Error(chrome.i18n.getMessage('ollamaConnectionError'))
      }

      const isOllamaOrigin = await this.verifyOllamaOrigin(urlToVerify)

      if (!isOllamaOrigin) {
        throw new Error(chrome.i18n.getMessage('ollamaOriginError'))
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(chrome.i18n.getMessage('ollamaConnectionError'))
      }

      throw error
    }

    return true
  }

  /**
   * Get the models available for the Ollama service
   * @returns {Promise<Model[]>} The models available for the Ollama service
   * @throws {Error} If the connection is not successful
   */
  public async getModels(): Promise<Model[]> {
    this.verifyConnection()

    const { models } = (await axios.get<OllamaTagsResponse>(`${this.baseURL}/api/tags`)).data

    const detailedModels = await Promise.all(
      models.map(async (model) => {
        const modelData = (
          await axios.post<ShowOllamaModel>(`${this.baseURL}/api/show`, {
            name: model.name
          })
        ).data

        const modelWithTag = model.model.split(':')

        return {
          name: model.name,
          model: modelWithTag[1] === 'latest' ? modelWithTag[0] : model.model,
          provider: AIProvider.ollama,
          hasVision: modelData?.projector_info?.['clip.has_vision_encoder'] || false
        } as Model
      })
    )

    return detailedModels
  }

  /**
   * Pull a model from the Ollama service
   * @param modelTag The tag of the model to pull
   * @returns {Promise<boolean>} True if the model was pulled successfully, false otherwise
   */
  public async pullModel(modelTag: string): Promise<Response> {
    this.verifyConnection()

    const response = await fetch(`${this.baseURL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: modelTag })
    })

    return response
  }

  /**
   * Delete a model by its tag
   * @param modelTag The tag of the model to delete
   * @returns {Promise<boolean>} True if the model was deleted successfully, false otherwise
   * @throws {Error} If the connection is not successful or the model could not be deleted
   */
  public async deleteModel(modelTag: string): Promise<boolean> {
    this.verifyConnection()

    await axios.request({
      method: 'DELETE',
      url: `${this.baseURL}/api/delete`,
      data: {
        name: modelTag
      }
    })

    return true
  }
}
