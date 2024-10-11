import { Icon } from '@iconify/react'
import { Button, Spacer, useDisclosure, Avatar, Modal, ModalContent } from '@nextui-org/react'

import ModelsTable from '@/sidebar/components/Settings/Integrations/Ollama/ModelsTable'
import PullModel from '@/sidebar/components/Settings/Integrations/Ollama/PullModel'
import { useOllama } from '@/sidebar/providers/OllamaProvider'

const ConfigureOllamaModels = () => {
  const { isOpen, onOpenChange } = useDisclosure()
  const { deleteModel, models } = useOllama()

  const content = (
    <div className="flex flex-col p-6">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center">
          <Avatar
            className="bg-content2"
            icon={<Icon width="32" height="32" icon="simple-icons:ollama" />}
          />
        </div>
        <span className="text-base font-medium leading-6 text-foreground">
          Manage ollama models
        </span>
      </div>
      <PullModel />
      <Spacer y={4} />
      <ModelsTable models={models} onModelDelete={async (model) => deleteModel(model.model)} />
    </div>
  )

  return (
    <>
      <Button size="sm" variant="faded" onClick={onOpenChange}>
        Models
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </>
  )
}

export default ConfigureOllamaModels
