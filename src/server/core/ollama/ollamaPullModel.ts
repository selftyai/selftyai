/* eslint-disable @typescript-eslint/no-explicit-any */
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'
import getOllamaService from '@/shared/getOllamaService'
import { ModelPullingStatus } from '@/shared/types/ollama/ModelPullingStatus'
import { createChromeStorage } from '@/utils/storage'
import { streamingFetch } from '@/utils/stream'

interface PullModelPayload {
  modelTag: string
  broadcastMessage: (data: any) => void
}

export const handlePullModel = async ({ modelTag, broadcastMessage }: PullModelPayload) => {
  const ollamaService = await getOllamaService()
  const storage = createChromeStorage('local')

  const pullingModels = JSON.parse(
    (await storage.getItem(OllamaStorageKeys.pullingModels)) ?? '[]'
  ) as string[]

  try {
    const generator = streamingFetch(() => ollamaService.pullModel(modelTag))

    await storage.setItem(
      OllamaStorageKeys.pullingModels,
      JSON.stringify([...pullingModels, modelTag])
    )

    broadcastMessage({ type: 'modelPullStart', modelTag })

    for await (const model of generator) {
      const modelPullingStatus = model as ModelPullingStatus
      modelPullingStatus.modelTag = modelTag

      if (modelPullingStatus.status === 'success') {
        const updatedPullingModels = pullingModels.filter((m) => m !== modelTag)
        await storage.setItem(OllamaStorageKeys.pullingModels, JSON.stringify(updatedPullingModels))
        broadcastMessage({ type: 'modelPullSuccess', modelTag })
        return
      }

      broadcastMessage({ type: 'modelPullStatus', status: modelPullingStatus })
    }
  } catch (error) {
    console.error(`Error pulling model ${modelTag}:`, error)

    const updatedPullingModels = pullingModels.filter((m) => m !== modelTag)
    await storage.setItem(OllamaStorageKeys.pullingModels, JSON.stringify(updatedPullingModels))
    broadcastMessage({
      type: 'modelPullError',
      modelTag,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

export async function checkOngoingPulls(broadcastMessage: (data: any) => void) {
  const storage = createChromeStorage('local')
  const pullingModels = JSON.parse(
    (await storage.getItem(OllamaStorageKeys.pullingModels)) ?? '[]'
  ) as string[]

  for (const modelTag of pullingModels) {
    handlePullModel({ modelTag, broadcastMessage })
  }
}
