import { Icon } from '@iconify/react'
import { Button, Card, CardBody, Divider, Input, Spacer, Progress } from '@nextui-org/react'
import React from 'react'

import { useOllama } from '@/providers/OllamaProvider'

const PullModel = () => {
  const modelTagRef = React.useRef<HTMLInputElement>(null)

  const { pullModel, pullingModels } = useOllama()

  const handlePullModel = (modelTag: string) => {
    pullModel(modelTag)

    if (modelTagRef.current) {
      modelTagRef.current.value = ''
    }
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
                disabled={!modelTagRef.current?.value}
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
