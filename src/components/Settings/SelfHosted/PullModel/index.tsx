import { Icon } from '@iconify/react'
import { Button, Card, CardBody, Divider, Input, Spacer, Progress } from '@nextui-org/react'
import React from 'react'
import { toast } from 'sonner'

import OllamaService from '@/services/ollama/OllamaService'
import { streamingFetch } from '@/utils/stream'

interface ModelPullingStatus {
  status: string
  digest?: string
  total?: number
  completed?: number
  modelTag?: string
}

interface PullModelProps {
  onPullModel: () => void
}

const PullModel = ({ onPullModel }: PullModelProps) => {
  const modelTagRef = React.useRef<HTMLInputElement>(null)

  const [pullingModels, setPullingModels] = React.useState<ModelPullingStatus[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iteratePull = async (generator: AsyncGenerator<any, void, unknown>, modelTag: string) => {
    for await (const model of generator) {
      const modelPullingStatus = model as ModelPullingStatus
      modelPullingStatus.modelTag = modelTag

      if (modelPullingStatus.status === 'success') {
        toast.success(`Model ${modelTag} has been pulled successfully`, {
          position: 'top-center'
        })
        setPullingModels((prev) => prev.filter((item) => item.modelTag !== modelTag))
        localStorage.setItem(
          'pullingModels',
          JSON.stringify(
            pullingModels.filter((item) => item.modelTag !== modelTag).map((item) => item.modelTag)
          )
        )
        onPullModel()
        return
      }

      setPullingModels((prev) =>
        prev.map((item) => (item.modelTag === modelTag ? modelPullingStatus : item))
      )
    }
  }

  React.useEffect(() => {
    async function checkPulling() {
      const pullingModels = JSON.parse(localStorage.getItem('pullingModels') ?? '[]') as string[]

      const ollamaRest = OllamaService.getInstance()

      setPullingModels(pullingModels.map((modelTag) => ({ status: 'pulling progress', modelTag })))

      await Promise.all(
        pullingModels.map(async (modelTag) => {
          const generator = streamingFetch(() => ollamaRest.pullModel(modelTag))

          await iteratePull(generator, modelTag)
        })
      )
    }

    checkPulling()
  }, [])

  const handlePullModel = async (modelTag: string) => {
    const ollamaRest = OllamaService.getInstance()

    const generator = streamingFetch(() => ollamaRest.pullModel(modelTag))

    const pullingModels = JSON.parse(localStorage.getItem('pullingModels') ?? '[]') as string[]
    localStorage.setItem('pullingModels', JSON.stringify([...pullingModels, modelTag]))

    setPullingModels((prev) => [...prev, { status: 'pulling progress', modelTag }])

    if (modelTagRef.current) {
      modelTagRef.current.value = ''
    }

    await iteratePull(generator, modelTag)
  }

  return (
    <>
      <Spacer y={3} />
      <Card className="mt-4 bg-default-100" shadow="none">
        <CardBody className="px-4">
          <div className="flex items-start justify-between pb-3">
            <p className="mt-1.5 text-sm font-medium text-default-700">
              Pull new model from Ollama
            </p>
            <Button
              className="bg-default-foreground text-background"
              endContent={<Icon className="h-3 w-3" icon="solar:link-linear" />}
              radius="md"
              size="sm"
              onClick={() => {
                window.open('https://ollama.com/library', '_blank')
              }}
            >
              All models
            </Button>
          </div>
          <Divider />
          <Spacer y={3} />
          <div className="py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="w-full">
                <p className="text-sm font-normal text-default-500">Model tag</p>
                <Input
                  className="mt-2"
                  classNames={{ inputWrapper: 'bg-default-200' }}
                  placeholder="e.g llama3.1:latest"
                  ref={modelTagRef}
                />
              </div>
            </div>
          </div>
          <Spacer y={3} />
          <Divider />
          <div>
            <div className="flex items-end justify-between pt-3">
              <p className="relative mb-2 text-xs text-default-500">
                Learn more about <span className="text-default-foreground">Ollama integration</span>
                <Icon
                  className={
                    'absolute right-0 top-0 h-2.5 w-2.5 translate-x-[8px] translate-y-[-2px] text-default-foreground'
                  }
                  icon="material-symbols-light:arrow-outward-rounded"
                />
              </p>
              <Button
                className="bg-default-foreground text-background"
                radius="md"
                size="sm"
                onClick={() => {
                  if (modelTagRef.current) {
                    handlePullModel(modelTagRef.current.value)
                  }
                }}
              >
                Pull
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      {pullingModels.map((modelPullingStatus) => (
        <React.Fragment key={modelPullingStatus.modelTag}>
          <Spacer y={3} />
          <div className="relative w-full rounded-medium border border-warning-100 bg-content2 bg-warning-100/50 px-4 py-3 text-foreground">
            {modelPullingStatus.total ? (
              <Progress
                label={`${modelPullingStatus.modelTag}: ${modelPullingStatus.status}`}
                size="sm"
                value={modelPullingStatus.completed}
                maxValue={modelPullingStatus.total}
                color="default"
                formatOptions={{ style: 'percent' }}
                showValueLabel={true}
                className="max-w-md"
              />
            ) : (
              <p className="text-sm font-medium">{`${modelPullingStatus.modelTag}: ${modelPullingStatus.status}`}</p>
            )}
          </div>
        </React.Fragment>
      ))}
    </>
  )
}

export default PullModel
