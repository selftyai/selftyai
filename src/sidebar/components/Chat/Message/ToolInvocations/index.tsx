import { ToolInvocation } from '@/shared/db/models/ToolInvocation'

import ToolInvocationItem from './ToolInvocationItem'

interface ToolInvocationsProps {
  tools: ToolInvocation[]
}

const ToolInvocations = ({ tools }: ToolInvocationsProps) => {
  return (
    <div className="flex flex-col gap-2">
      {tools.map((tool) => (
        <ToolInvocationItem key={tool.runId} invocation={tool} />
      ))}
    </div>
  )
}

export default ToolInvocations
