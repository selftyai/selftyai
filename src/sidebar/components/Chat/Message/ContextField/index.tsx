import { Icon } from '@iconify/react/dist/iconify.js'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tooltip,
  useDisclosure
} from '@nextui-org/react'

import Markdown from '@/sidebar/components/Chat/Message/Markdown'

interface ContextFieldProps {
  messageContext?: string
}

const ContextField = ({ messageContext }: ContextFieldProps) => {
  const { isOpen, onOpenChange } = useDisclosure()
  return (
    messageContext && (
      <>
        <div className="mb-2 w-full rounded-lg bg-content2">
          <div className="flex items-center justify-end gap-3 p-2">
            <Icon icon="mage:l-arrow-down-right" className="mx-2 h-8 min-w-4" />
            <span className="line-clamp-2 flex-1 break-words text-xs">{messageContext}</span>
            <Tooltip content="See full message context &#128065;">
              <Button isIconOnly size="sm" variant="light" onClick={onOpenChange}>
                {isOpen ? <Icon icon="mdi-light:eye" /> : <Icon icon="mdi:eye-closed" />}
              </Button>
            </Tooltip>
          </div>
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>{'Message Context'}</ModalHeader>
            <ModalBody className="flex flex-1 flex-col p-6 pt-0 text-base">
              <Markdown message={messageContext} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
  )
}

export default ContextField
