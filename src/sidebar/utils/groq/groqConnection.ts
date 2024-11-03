import i18next from 'i18next'
import { toast } from 'sonner'

import { ERROR_MESSAGES } from '@/sidebar/constants/groq'
import { GroqConnectionError } from '@/sidebar/types/Groq'

export const handleConnectionResult = (
  connected: boolean,
  error: GroqConnectionError | string | undefined,
  isVerifying: boolean
) => {
  if (!isVerifying) return

  if (!connected) {
    const errorMessage = error
      ? ERROR_MESSAGES[error as GroqConnectionError]?.() || error
      : 'Unknown error'
    toast.error(errorMessage, { position: 'top-center' })
    return
  }

  toast.success(i18next.t('settings.integrations.groq.connected'), {
    position: 'top-center'
  })
}
