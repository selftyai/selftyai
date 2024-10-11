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
  ModalContent,
  Switch
} from '@nextui-org/react'
import React from 'react'

import ConfigureOllamaModels from '@/sidebar/components/Settings/Integrations/Ollama/ConfigureOllamaModels'
import { useOllama } from '@/sidebar/providers/OllamaProvider'

const ConfigureOllama = () => {
  const { isOpen, onOpenChange } = useDisclosure()

  const {
    baseURL,
    changeBaseURL,
    connected,
    pullingModels,
    enabled,
    enableOllama,
    disableOllama,
    error
  } = useOllama()

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

      <div className="mb-2 flex flex-col gap-3">
        <div className="relative w-full rounded-medium border border-warning-100 bg-content2 bg-warning-100/50 px-4 py-3 text-foreground">
          Set Up Cross-Origin Access for Ollama to work properly. Follow the{' '}
          <Link
            href="https://medium.com/dcoderai/how-to-handle-cors-settings-in-ollama-a-comprehensive-guide-ee2a5a1beef0"
            target="_blank"
            className="text-xs font-medium text-default-foreground hover:underline"
          >
            guide
          </Link>{' '}
          if you are not setup it yet.
        </div>

        <div className="relative w-full rounded-medium border border-default-100 bg-content2 bg-default-100/50 px-4 py-3 text-foreground">
          If you are using Ollama on your local machine and want to change where models are stored,
          you can do so by following{' '}
          <Link
            href="https://dev.to/hamed0406/how-to-change-place-of-saving-models-on-ollama-4ko8"
            target="_blank"
            className="text-xs font-medium text-default-foreground hover:underline"
          >
            this guide
          </Link>
          .
        </div>

        {error && (
          <div className="relative w-full rounded-medium border border-danger-100 bg-content2 bg-danger-100/50 px-4 py-3 text-foreground">
            {error === 'ollamaOriginError' ? (
              <span>Ollama is not accessible from the current origin. Please check the CORS.</span>
            ) : error === 'ollamaConnectionError' ? (
              <span>
                Ollama is not connected. Please check your base URL and try again. If you don't use
                dedicated server, verify you have installed Ollama on your local machine.
              </span>
            ) : (
              <span>{error}</span>
            )}
          </div>
        )}
      </div>

      <div className="mb-5 flex flex-col gap-2">
        <p className="text-base font-medium text-default-700">
          Base URL <span className="text-red-500">*</span>
        </p>
        <p className="text-sm font-normal text-default-400">
          By default, the base URL is set to{' '}
          <span className="text-default-700">http://127.0.0.1:11434</span>. If you have a dedicated
          server, you can change the base URL here.
        </p>
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
          <Button radius="md" size="sm" color="default" onClick={onOpenChange}>
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
            }}
          >
            Save & Verify
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex flex-row gap-2">
        <Switch
          isSelected={enabled}
          onValueChange={(value) => (value ? enableOllama() : disableOllama())}
          size="sm"
        />
        {enabled && (
          <React.Fragment>
            <Button size="sm" variant="faded" onClick={onOpenChange}>
              <Icon
                icon={connected ? 'akar-icons:circle-check' : 'akar-icons:circle-alert'}
                className={cn('size-3', connected ? 'text-success-500' : 'text-danger-500')}
              />
              Configure
            </Button>
            {connected && <ConfigureOllamaModels />}
          </React.Fragment>
        )}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </>
  )
}

export default ConfigureOllama
