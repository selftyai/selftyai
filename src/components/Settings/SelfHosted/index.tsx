import { Input, Spacer, ScrollShadow, Button } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import * as React from 'react'
import { toast } from 'sonner'

import ModelsTable from '@/components/Settings/SelfHosted/ModelsTable'
import PullModel from '@/components/Settings/SelfHosted/PullModel'
import { useOllama } from '@/providers/OllamaProvider'

interface TeamSettingCardProps {
  className?: string
}

const OllamaSetting = React.forwardRef<HTMLDivElement, TeamSettingCardProps>(
  ({ className, ...rest }, ref) => {
    const { baseURL, deleteModel, changeBaseURL, models, connected, error, pullingModels } =
      useOllama()

    const inputRef = React.useRef<HTMLInputElement>(null)

    return (
      <ScrollShadow {...rest} ref={ref} className={cn('py-2', className)}>
        {!connected && error.length && (
          <>
            <div className="relative w-full rounded-medium border border-danger-100 bg-content2 bg-danger-100/50 px-4 py-3 text-foreground">
              {error}
            </div>
            <Spacer y={3} />
          </>
        )}
        <div>
          <p className="text-base font-medium text-default-700">Ollama's base URL</p>
          <p className="mt-1 text-sm font-normal text-default-400">
            By default, the base URL is set to{' '}
            <span className="text-default-700">http://127.0.0.1:11434</span>. If you have a
            dedicated server, you can change the base URL here.
          </p>
          <Input
            className="mt-2"
            ref={inputRef}
            defaultValue={baseURL}
            placeholder=""
            validate={(value) => {
              if (!value) {
                return 'Base URL is required'
              }
              return ''
            }}
            endContent={
              <Button
                className="bg-default-foreground text-background"
                radius="md"
                size="sm"
                disabled={!inputRef.current?.value || pullingModels.length > 0}
                onClick={() => {
                  changeBaseURL(inputRef.current?.value || 'http://127.0.0.1:11434')

                  toast.success('Base URL updated successfully', {
                    position: 'top-center',
                    duration: 5000
                  })
                }}
              >
                Save
              </Button>
            }
          />
        </div>
        {connected && (
          <>
            <PullModel />

            <Spacer y={4} />
            <ModelsTable
              models={models}
              onModelDelete={async (model) => deleteModel(model.model)}
            />
          </>
        )}
      </ScrollShadow>
    )
  }
)

export default OllamaSetting
