import { Icon } from '@iconify/react'
import { Button, Spacer, useDisclosure, Avatar, Modal, ModalContent } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'

import ModelsTable from '@/sidebar/components/Settings/Integrations/Ollama/ModelsTable'
import PullModel from '@/sidebar/components/Settings/Integrations/Ollama/PullModel'

const ConfigureOllamaModels = () => {
  const { isOpen, onOpenChange } = useDisclosure()
  const { t } = useTranslation()

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
          {t('settings.integrations.ollama.models.title')}
        </span>
      </div>
      <PullModel />
      <Spacer y={4} />
      <ModelsTable />
    </div>
  )

  return (
    <>
      <Button size="sm" variant="faded" onClick={onOpenChange}>
        {t('settings.integrations.ollama.models.button')}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{content}</ModalContent>
      </Modal>
    </>
  )
}

export default ConfigureOllamaModels
