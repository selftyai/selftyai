import createOllamaService from '@/server/utils/ollama/createOllamaService'
import { streamingFetch } from '@/server/utils/stream'
import { db } from '@/shared/db'
import { ModelPullingStatus } from '@/shared/types/ollama/ModelPullingStatus'

interface PullModelResponse {
  success: boolean
  error?: string
  modelTag: string
}

export default async function pullModel(modelTag: string): Promise<PullModelResponse> {
  const service = await createOllamaService()

  try {
    const pullingStatusStream = streamingFetch(() => service.pullModel(modelTag))

    const model = await db.ollamaPullingModels.where({ modelTag }).first()
    const modelId =
      model?.id ??
      (await db.ollamaPullingModels.add({
        modelTag,
        status: JSON.stringify({
          status: 'pulling manifest'
        })
      }))

    for await (const statusUpdate of pullingStatusStream) {
      const modelPullingStatus = statusUpdate as ModelPullingStatus

      if (modelPullingStatus.status === 'success') {
        await db.ollamaPullingModels.delete(modelId)
        break
      }

      await db.ollamaPullingModels.update(modelId, { status: JSON.stringify(modelPullingStatus) })
    }
  } catch (error) {
    console.warn(`[ollamaPullModel] Error pulling model ${modelTag}:`, error)
    await db.ollamaPullingModels.where({ modelTag }).delete()

    return {
      success: false,
      modelTag,
      error: error instanceof Error ? error.message : String(error)
    }
  }

  return { success: true, modelTag }
}
