import axios from 'axios'

import { BaseService } from '@/server/services/BaseService'
import { Model } from '@/shared/db/models/Model'
import { Integrations } from '@/shared/types/Integrations'
import { GithubModelItem } from '@/shared/types/github/GithubModelItem'

export class GithubService extends BaseService {
  private static instance: GithubService | null = null

  private constructor() {
    super()
  }

  public static getInstance(): GithubService {
    if (!GithubService.instance) {
      GithubService.instance = new GithubService()
    }

    return GithubService.instance
  }

  /**
   * Get the models available for the Github service
   * @returns {Promise<Model[]>} The models available for the Github service
   */
  public async getModels(): Promise<Model[]> {
    try {
      const { data } = await axios.get('https://models.inference.ai.azure.com/models')
      const models = data as GithubModelItem[]

      const filteredModels = models.filter((model) => model.task === 'chat-completion')

      return filteredModels.map(
        (model) =>
          ({
            name: model.friendly_name,
            vision: true,
            supportTool: true,
            model: model.name,
            provider: Integrations.githubModels
          }) as Model
      )
    } catch {
      return []
    }
  }
}
