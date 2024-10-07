import { Icon } from '@iconify/react'
import {
  Button,
  Input,
  Spacer,
  useDisclosure,
  cn,
  Avatar,
  Link,
  Modal,
  ModalContent
} from '@nextui-org/react'
import React from 'react'
import { toast } from 'sonner'

import ConfigureOllamaModels from '@/sidebar/components/Settings/Integrations/Ollama/ConfigureOllamaModels'
import { useOllama } from '@/sidebar/providers/OllamaProvider'

const ConfigureOllama = () => {
  const { isOpen, onOpenChange } = useDisclosure()

  const { baseURL, changeBaseURL, connected, error, pullingModels } = useOllama()

  const [input, setInput] = React.useState(baseURL)

  const content = (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center">
          <Avatar
            className="bg-content2"
            icon={<Icon width="32" height="32" icon="simple-icons:ollama" />}
          />
        </div>
        <span className="text-base font-medium leading-6 text-foreground">Ollama settings</span>
      </div>

      <Spacer y={8} />

      <div className="mb-5 flex flex-col gap-2">
        <p className="text-base font-medium text-default-700">
          Base URL <span className="text-red-500">*</span>
        </p>
        <p className="text-sm font-normal text-default-400">
          By default, the base URL is set to{' '}
          <span className="text-default-700">http://127.0.0.1:11434</span>. If you have a dedicated
          server, you can change the base URL here.
        </p>
        {connected ? (
          <div className="relative w-full rounded-medium border border-default-100 bg-content2 bg-default-100/50 px-4 py-3 text-foreground">
            If you are using Ollama on your local machine and want to change where models are
            stored, you can do so by following{' '}
            <Link
              href="https://dev.to/hamed0406/how-to-change-place-of-saving-models-on-ollama-4ko8"
              target="_blank"
              className="text-sm"
            >
              this guide
            </Link>
            .
          </div>
        ) : (
          <div className="relative w-full rounded-medium border border-danger-100 bg-content2 bg-danger-100/50 px-4 py-3 text-foreground">
            {error}
          </div>
        )}
        <p
          className={cn(
            'ml-auto inline-flex items-center gap-2 text-xs font-normal',
            connected ? 'text-success-500' : 'text-danger-500'
          )}
        >
          <Icon
            icon={connected ? 'akar-icons:circle-check' : 'akar-icons:circle-alert'}
            className="h-3 w-3"
          />
          {connected ? 'Connected' : 'Disconnected'}
        </p>
        <Input
          className="mt-2"
          variant="flat"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          defaultValue={baseURL}
          placeholder=""
          validate={(value) => {
            if (!value) {
              return 'Base URL is required'
            }
            return ''
          }}
        />

        <div className="ml-auto mt-1 flex flex-row gap-2">
          <Button radius="md" size="sm" color="default" onClick={() => setInput(baseURL)}>
            Cancel
          </Button>
          <Button
            className="bg-default-foreground text-background"
            radius="md"
            size="sm"
            color="secondary"
            isDisabled={!input.length || pullingModels.length > 0 || input === baseURL}
            onClick={() => {
              changeBaseURL(input)

              toast.success('Base URL updated successfully', {
                position: 'top-center',
                duration: 5000
              })
            }}
          >
            Verify & Save
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex flex-row gap-2">
        <Button size="sm" variant="faded" onClick={onOpenChange}>
          <Icon
            icon={connected ? 'akar-icons:circle-check' : 'akar-icons:circle-alert'}
            className={cn('size-3', connected ? 'text-success-500' : 'text-danger-500')}
          />
          Configure
        </Button>
        {connected && <ConfigureOllamaModels />}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </>
  )
}

export default ConfigureOllama
