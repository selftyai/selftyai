import { Icon } from '@iconify/react'
import { Input, Spacer, ScrollShadow } from '@nextui-org/react'
import { cn } from '@nextui-org/react'
import * as React from 'react'
import { toast } from 'sonner'

import ModelsTable from '@/components/Settings/SelfHosted/ModelsTable'
import PullModel from '@/components/Settings/SelfHosted/PullModel'
import OllamaService from '@/services/ollama/OllamaService'
import { Model } from '@/services/types/Model'

interface TeamSettingCardProps {
  className?: string
}

const parseError = (error: string) => {
  if (error.includes('<LINK>')) {
    return error.split('<LINK>').map((item, index) => {
      if (index === 1) {
        return (
          <span className="relative">
            <a
              href="https://medium.com/dcoderai/how-to-handle-cors-settings-in-ollama-a-comprehensive-guide-ee2a5a1beef0"
              target="_blank"
              className="text-default-foreground hover:underline"
            >
              {chrome.i18n.getMessage('setupOllamaOrigins')}
            </a>
            <Icon
              className={
                'absolute right-0 top-0 h-2.5 w-2.5 translate-x-[8px] translate-y-[-2px] text-default-foreground'
              }
              icon="material-symbols-light:arrow-outward-rounded"
            />
          </span>
        )
      }

      return <p key={index}>{item}</p>
    })
  }

  return [<p>{error}</p>] as JSX.Element[]
}

const TeamSetting = React.forwardRef<HTMLDivElement, TeamSettingCardProps>(
  ({ className, ...rest }, ref) => {
    const [models, setModels] = React.useState<Model[]>([])
    const [connected, setConnected] = React.useState(false)
    const [error, setError] = React.useState<JSX.Element[]>()
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
      async function fetchData() {
        setIsLoading(true)

        const ollamaRest = OllamaService.getInstance()

        try {
          const connected = await ollamaRest.verifyConnection()
          setConnected(connected)

          if (!connected) {
            return
          }

          const models = await ollamaRest.getModels()
          setModels(models)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          setConnected(false)
          console.log(error.message)
          setError(parseError(error.message))
        }

        setIsLoading(false)
      }

      fetchData()
    }, [])

    return (
      <ScrollShadow {...rest} ref={ref} className={cn('py-2', className)}>
        {!connected && !isLoading && (
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
          <Input className="mt-2" defaultValue="http://127.0.0.1:11434" placeholder="" />
        </div>
        {connected && (
          <>
            <PullModel
              onPullModel={() => {
                const ollamaService = OllamaService.getInstance()

                ollamaService.getModels().then(setModels)
              }}
            />

            <Spacer y={4} />
            <ModelsTable
              models={models}
              onModelDelete={async (model) => {
                const ollamaService = OllamaService.getInstance()

                const response = await ollamaService.deleteModel(model.model)

                if (!response.ok || response.status !== 200) {
                  toast.error('Failed to delete model', {
                    position: 'top-center',
                    duration: 5000
                  })
                  return
                }

                ollamaService.getModels().then(setModels)

                toast.error('Model deleted successfully', {
                  position: 'top-center',
                  duration: 5000
                })
              }}
            />
          </>
        )}
      </ScrollShadow>
    )
  }
)

TeamSetting.displayName = 'TeamSetting'

export default TeamSetting
