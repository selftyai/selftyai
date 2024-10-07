/* eslint-disable @typescript-eslint/no-explicit-any */
import getOllamaService from '@/server/core/ollama/getOllamaService'
import { StateStorage } from '@/server/types/Storage'
import { OllamaStorageKeys } from '@/server/types/ollama/OllamaStoragsKeys'
import { streamingFetch } from '@/server/utils/stream'
import { ModelPullingStatus } from '@/shared/types/ollama/ModelPullingStatus'

interface PullModelPayload {
  modelTag: string
  storage: StateStorage
  broadcastMessage: (data: any) => void
}

export const handlePullModel = async ({
  modelTag,
  storage,
  broadcastMessage
}: PullModelPayload) => {
  const ollamaService = await getOllamaService(storage)

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

export async function checkOngoingPulls(
  broadcastMessage: (data: any) => void,
  storage: StateStorage
) {
  const pullingModels = JSON.parse(
    (await storage.getItem(OllamaStorageKeys.pullingModels)) ?? '[]'
  ) as string[]

  const uniquePullingModels = [...new Set(pullingModels)]

  console.log('Checking ongoing pulls:', uniquePullingModels)

  await Promise.all(
    uniquePullingModels.map((modelTag) => handlePullModel({ modelTag, storage, broadcastMessage }))
  )
}
