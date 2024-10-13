import getOllamaService from '@/server/core/ollama/getOllamaService'
import { db } from '@/shared/db'

interface OllamaVerifyConnectionPayload {
  url?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcastMessage: (data: any) => void
}

const ollamaVerifyConnection = async ({ url }: OllamaVerifyConnectionPayload) => {
  const ollamaService = await getOllamaService()

  const integration = await db.integrations.get({ name: 'ollama' })

  const storedURL = integration?.baseURL || 'http://localhost:11434'

  try {
    const connected = await ollamaService.verifyConnection(url ?? storedURL)

    return {
      connected,
      url: url ?? storedURL
    }
  } catch (error: unknown) {
    return {
      connected: false,
      url: url ?? storedURL,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export default ollamaVerifyConnection
