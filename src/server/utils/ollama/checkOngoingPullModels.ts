import pullModel from '@/server/utils/ollama/pullModel'
import { db } from '@/shared/db'

export default async function checkOngoingPullModels() {
  const pullingModels = await db.ollamaPullingModels.toArray()

  await Promise.all(pullingModels.map((model) => pullModel(model.modelTag)))
}
