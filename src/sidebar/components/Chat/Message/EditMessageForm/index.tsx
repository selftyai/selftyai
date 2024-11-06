import { Button } from '@nextui-org/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import PromptInput from '@/sidebar/components/Textarea/PromptInput'

interface EditMessageFormProps {
  message: string
  onEdit: (message: string) => void
  onCancel: () => void
}

const EditMessageForm: React.FC<EditMessageFormProps> = ({ message, onEdit, onCancel }) => {
  const { t } = useTranslation()

  const [editedMessage, setEditedMessage] = React.useState(message)

  return (
    <div className="w-full rounded-3xl bg-content2 px-3 py-3">
      <PromptInput
        classNames={{
          inputWrapper: '!bg-transparent shadow-none',
          innerWrapper: 'relative',
          input: 'p-2 text-medium'
        }}
        placeholder={t('newMessage')}
        className="max-h-[25dvh] overflow-auto"
        value={editedMessage}
        onValueChange={setEditedMessage}
        radius="lg"
        variant="flat"
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" onPress={onCancel} radius="lg">
          {t('cancel')}
        </Button>
        <Button
          size="sm"
          className="bg-default-foreground text-background"
          radius="lg"
          onPress={() => onEdit(editedMessage)}
          isDisabled={editedMessage === message || !editedMessage}
        >
          {t('send')}
        </Button>
      </div>
    </div>
  )
}

export default EditMessageForm
