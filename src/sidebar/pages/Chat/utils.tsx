import { Icon } from '@iconify/react'

export const suggestions = [
  {
    key: 'message1',
    description: chrome.i18n.getMessage('message1'),
    icon: <Icon className="text-primary-700" icon="solar:notebook-square-bold" width={24} />
  },
  {
    key: 'message2',
    description: chrome.i18n.getMessage('message2'),
    icon: <Icon className="text-danger-600" icon="solar:chat-square-like-bold" width={24} />
  },
  {
    key: 'message3',
    description: chrome.i18n.getMessage('message3'),
    icon: <Icon className="text-warning-600" icon="solar:user-id-bold" width={24} />
  },
  {
    key: 'message4',
    description: chrome.i18n.getMessage('message4'),
    icon: <Icon className="text-success-600" icon="solar:gameboy-bold" width={24} />
  }
]

export const icons = ['solar:star-rings-linear', 'solar:star-shine-outline', 'solar:star-linear']
