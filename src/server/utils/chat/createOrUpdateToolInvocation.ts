import { db } from '@/shared/db'
import { ToolInvocation } from '@/shared/db/models/ToolInvocation'

export default async function createOrUpdateToolInvocation(
  data:
    | Omit<ToolInvocation, 'id' | 'messageId'>
    | Omit<ToolInvocation, 'id' | 'subName' | 'output' | 'error' | 'status'>
): Promise<ToolInvocation> {
  return await db.transaction('rw', db.toolInvocations, async () => {
    const existingToolInvocation = await db.toolInvocations
      .where({ toolName: data.toolName, runId: data.runId })
      .first()

    if (existingToolInvocation && existingToolInvocation.id) {
      await db.toolInvocations.update(existingToolInvocation.id, data)

      return {
        ...existingToolInvocation,
        ...data
      }
    }

    const toolInvocationId = await db.toolInvocations.add(data as ToolInvocation)

    return db.toolInvocations.get(toolInvocationId) as Promise<ToolInvocation>
  })
}
