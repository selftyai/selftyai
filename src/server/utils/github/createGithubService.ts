import { GithubService } from '@/server/services/GithubService'
import getOrCreateGithubIntegration from '@/server/utils/github/getOrCreateGithubIntegration'

/**
 * Create a Github service
 * @param url The API key
 */
export default async function createGithubService(url?: string) {
  const service = GithubService.getInstance()
  const integration = await getOrCreateGithubIntegration()
  service.setBaseURL(url || integration?.apiKey || '')

  return service
}
