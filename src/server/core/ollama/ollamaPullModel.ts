/* eslint-disable @typescript-eslint/no-explicit-any */
import getOllamaService from '@/server/core/ollama/getOllamaService'
import { streamingFetch } from '@/server/utils/stream'
import { db } from '@/shared/db'
import { ModelPullingStatus } from '@/shared/types/ollama/ModelPullingStatus'

interface PullModelPayload {
  modelTag: string
  broadcastMessage: (data: any) => void
}

export const handlePullModel = async ({ modelTag, broadcastMessage }: PullModelPayload) => {
  const ollamaService = await getOllamaService()

  try {
    const generator = streamingFetch(() => ollamaService.pullModel(modelTag))

    const model = await db.ollamaPullingModels.where({ modelTag }).first()

    const modelId =
      model && model.id
        ? model.id
        : await db.ollamaPullingModels.add({ modelTag, status: 'pulling manifest' })

    for await (const model of generator) {
      const modelPullingStatus = model as ModelPullingStatus

      if (modelPullingStatus.status === 'success') {
        await db.ollamaPullingModels.delete(modelId)
        broadcastMessage({ type: 'modelPullSuccess', modelTag })
        return
      }

      await db.ollamaPullingModels.update(modelId, { status: JSON.stringify(modelPullingStatus) })
    }
  } catch (error) {
    console.warn(`[ollamaPullModel] Error pulling model ${modelTag}:`, error)
    await db.ollamaPullingModels.where({ modelTag }).delete()

    broadcastMessage({
      type: 'modelPullError',
      modelTag,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

export async function checkOngoingPulls(broadcastMessage: (data: any) => void) {
  const pullingModels = await db.ollamaPullingModels.toArray()

  await Promise.all(
    pullingModels.map((model) => handlePullModel({ modelTag: model.modelTag, broadcastMessage }))
  )
}
