import { Icon } from '@iconify/react'
import { Button, Card, CardBody, Divider, Input, Spacer, Progress, Link } from '@nextui-org/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import type { ModelPullingStatus } from '@/shared/types/ollama/ModelPullingStatus'
import { useOllama } from '@/sidebar/providers/OllamaProvider'

const PullModel = () => {
  const [modelTag, setModelTag] = React.useState<string>('')
  const { t } = useTranslation()

  const { pullModel, pullingModels } = useOllama()

  const handlePullModel = (modelTag: string) => {
    pullModel(modelTag)

    setModelTag('')
  }

  return (
    <>
      <Spacer y={3} />
      <Card className="mt-4 bg-default-100" shadow="none">
        <CardBody className="px-4">
          <div className="flex items-start justify-between pb-3">
            <p className="mt-1.5 text-sm font-medium text-default-700">
              {t('settings.integrations.ollama.models.pullModel.description')}
            </p>
            <Button
              as={Link}
              className="bg-default-foreground text-background"
              endContent={<Icon className="h-3 min-w-3" icon="solar:link-linear" />}
              radius="md"
              size="sm"
              href="https://ollama.com/library"
              target="_blank"
            >
              {t('settings.integrations.ollama.models.pullModel.library')}
            </Button>
          </div>
          <Divider />
          <Spacer y={3} />
          <div className="py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="w-full">
                <p className="text-sm font-normal text-default-500">
                  {t('settings.integrations.ollama.models.pullModel.modelTag')}
                </p>
                <Input
                  className="mt-2"
                  classNames={{ inputWrapper: 'bg-default-200' }}
                  placeholder={t('settings.integrations.ollama.models.pullModel.placeholder')}
                  value={modelTag}
                  onChange={(e) => setModelTag(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Spacer y={3} />
          <Divider />
          <div>
            <div className="flex items-end justify-end pt-3">
              <Button
                className="bg-default-foreground text-background"
                radius="md"
                size="sm"
                isDisabled={!modelTag}
                onClick={() => handlePullModel(modelTag)}
              >
                {t('settings.integrations.ollama.models.pullModel.pull')}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      {pullingModels?.map(({ modelTag, status }) => {
        const modelPullingStatus = JSON.parse(status) as ModelPullingStatus

        return (
          <React.Fragment key={modelTag}>
            <Spacer y={3} />
            <div className="relative w-full rounded-medium border border-warning-100 bg-content2 bg-warning-100/50 px-4 py-3 text-foreground">
              {modelPullingStatus.total ? (
                <Progress
                  label={`${modelTag}: ${modelPullingStatus.status}`}
                  size="sm"
                  value={modelPullingStatus.completed}
                  maxValue={modelPullingStatus.total}
                  color="default"
                  formatOptions={{ style: 'percent' }}
                  showValueLabel={true}
                  className="max-w-md"
                />
              ) : (
                <p className="text-sm font-medium">{`${modelTag}: ${modelPullingStatus.status}`}</p>
              )}
            </div>
          </React.Fragment>
        )
      })}
    </>
  )
}

export default PullModel
