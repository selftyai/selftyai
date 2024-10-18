import axios from 'axios'

import { BaseService } from '@/server/services/BaseService'
import type { OllamaTagsResponse } from '@/server/types/ollama/OllamaTagsResponse'
import type { ShowOllamaModel } from '@/server/types/ollama/ShowOllamaModel'
import { Model } from '@/shared/db/models/Model'
import { Integrations } from '@/shared/types/Integrations'
import { OllamaErrorEnum } from '@/shared/types/ollama/OllamaErrorEnum'

export class OllamaService extends BaseService {
  private static instance: OllamaService | null = null
  private ollamaText = 'Ollama is running'
  private fetchedModels: Model[] = []

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
   * Verify the connection to the Ollama service
   * @param url The base URL for the Ollama service. If not provided, the base URL set in the service will be used.
   * @returns True if the connection is successful, false otherwise
   * @throws {Error} If the connection is not successful
   */
  public async verifyConnection(url?: string): Promise<boolean> {
    const urlToVerify = url || this.baseURL

    const response = await axios.get(urlToVerify)

    if (response.status !== 200 || response.data !== this.ollamaText) {
      throw new Error(OllamaErrorEnum.ollamaConnectionError)
    }

    return true
  }

  /**
   * Get the models available for the Ollama service
   * @returns {Promise<Model[]>} The models available for the Ollama service
   * @throws {Error} If the connection is not successful
   */
  public async getModels(): Promise<Model[]> {
    try {
      const { data } = await axios.get<OllamaTagsResponse>(`${this.baseURL}/api/tags`)

      const { models } = data

      const modelsToFetch = models.filter(
        (model) => !this.fetchedModels.some((fetchedModel) => fetchedModel.name === model.name)
      )

      const detailedModels = await Promise.all(
        modelsToFetch.map(async (model) => {
          const { data: modelData } = await axios.post<ShowOllamaModel>(
            `${this.baseURL}/api/show`,
            {
              name: model.name
            }
          )
          const splitModel = model.model.split(':')
          const modelName =
            splitModel.length > 1 && splitModel[1] === 'latest' ? splitModel[0] : model.model

          return {
            name: model.name,
            model: modelName,
            provider: Integrations.ollama,
            vision: modelData?.projector_info?.['clip.has_vision_encoder'] || false
          } as Model
        })
      )

      this.fetchedModels.push(...detailedModels)

      return this.fetchedModels
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error getting Ollama models', error.response?.status)

        if (error.response?.status === 403) {
          throw new Error(OllamaErrorEnum.ollamaOriginError)
        }

        throw new Error(OllamaErrorEnum.ollamaConnectionError)
      }

      throw error
    }
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

    if (response.status === 403) {
      throw new Error(OllamaErrorEnum.ollamaOriginError)
    }

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
