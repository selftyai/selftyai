import AIService from '@/services/AIService'
import CacheService from '@/services/cache/CacheService'
import type { OllamaModel, ShowOllamaModel } from '@/services/ollama/types'
import { CacheKey } from '@/services/ollama/types/CacheKey'
import type { Model } from '@/services/types/Model'
import { Provider } from '@/services/types/Provider'

class OllamaService extends AIService {
  private static instance: OllamaService | null = null
  private cacheManager: CacheService
  private baseURL: string = 'http://127.0.0.1:11434'
  private initialized: boolean = false

  constructor() {
    super()
    this.cacheManager = new CacheService('ollama')
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService()
    }
    return OllamaService.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    const cachedBaseURL = await this.cacheManager.get<string>(CacheKey.BaseURL)
    if (cachedBaseURL) {
      this.baseURL = cachedBaseURL
    }
    this.initialized = true
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  async verifyConnection(url?: string): Promise<boolean> {
    await this.ensureInitialized()

    const urlToVerify = url || this.baseURL

    const ollamaText = 'Ollama is running'

    const response = await fetch(`${urlToVerify}`, {
      method: 'GET'
    })
    const text = await response.text()

    if (!response.ok || text !== ollamaText) {
      throw new Error(chrome.i18n.getMessage('ollamaConnectionError'))
    }

    const showResponse = await fetch(`${urlToVerify}/api/show`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: '' })
    })

    if (showResponse.status === 403) {
      throw new Error(chrome.i18n.getMessage('ollamaOriginError'))
    }

    const showResponseJson = await showResponse.json()

    return showResponseJson.error === 'model is required'
  }

  async getModels(): Promise<Model[]> {
    await this.verifyConnection()

    const response = await fetch(`${this.baseURL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(chrome.i18n.getMessage('ollamaConnectionError'))
    }

    const { models } = (await response.json()) as { models: OllamaModel[] }

    const fetchedData = await Promise.all(
      models.map(async (model) => {
        const modelResponse = await fetch(`${this.baseURL}/api/show`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: model.name })
        })

        if (!modelResponse.ok) {
          throw new Error(chrome.i18n.getMessage('ollamaConnectionError'))
        }

        const modelData = (await modelResponse.json()) as ShowOllamaModel

        const modelWithTag = model.model.split(':')

        return {
          name: model.name,
          model: modelWithTag[1] === 'latest' ? modelWithTag[0] : model.model,
          provider: Provider.OLLAMA,
          hasVision: modelData.projector_info?.['clip.has_vision_encoder'] || false
        } satisfies Model
      })
    )

    return fetchedData
  }

  async setBaseURL(baseURL: string): Promise<boolean> {
    await this.ensureInitialized()
    const connectionVerified = await this.verifyConnection(baseURL)

    if (!connectionVerified) {
      return false
    }

    this.baseURL = baseURL
    await this.cacheManager.set(CacheKey.BaseURL, baseURL)

    return true
  }

  async getBaseURL(): Promise<string> {
    await this.ensureInitialized()
    return this.baseURL
  }

  async pullModel(modelTag: string) {
    await this.verifyConnection()

    const response = await fetch(`${this.baseURL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: modelTag })
    })

    return response
  }

  async deleteModel(modelTag: string) {
    await this.verifyConnection()

    const response = await fetch(`${this.baseURL}/api/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: modelTag })
    })

    return response
  }
}

export default OllamaService
