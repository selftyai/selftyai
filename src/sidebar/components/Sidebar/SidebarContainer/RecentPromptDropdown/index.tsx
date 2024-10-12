import { Icon } from '@iconify/react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, cn } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'

interface RecentPromptDropdownProps {
  onDelete: () => void
  onPin: () => void
  onUnpin: () => void
  selected?: boolean
  pinned?: boolean
}

const RecentPromptDropdown = ({
  onDelete,
  onPin,
  onUnpin,
  selected,
  pinned
}: RecentPromptDropdownProps) => {
  const { t } = useTranslation()

  return (
    <Dropdown>
      <DropdownTrigger>
        <Icon
          className={cn('hidden text-default-500 group-hover:block', selected && 'block')}
          icon="solar:menu-dots-bold"
          width={24}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Dropdown menu with icons"
        className="py-2"
        variant="faded"
        onAction={(key) => {
          const keys = {
            delete: onDelete,
            pin: onPin,
            unpin: onUnpin
          }

          const handler = keys[key as keyof typeof keys]
          if (handler) handler()
        }}
      >
        {/* <DropdownItem
          key="rename"
          className="text-default-500 data-[hover=true]:text-default-500"
          startContent={
            <Icon className="text-default-300" height={20} icon="solar:pen-linear" width={20} />
          }
        >
          Rename
        </DropdownItem> */}
        {pinned ? (
          <DropdownItem
            key="unpin"
            className="text-default-500 data-[hover=true]:text-default-500"
            startContent={
              <Icon className="text-default-300" height={20} icon="solar:pin-linear" width={20} />
            }
          >
            {t('unpin')}
          </DropdownItem>
        ) : (
          <DropdownItem
            key="pin"
            className="text-default-500 data-[hover=true]:text-default-500"
            startContent={
              <Icon className="text-default-300" height={20} icon="solar:pin-linear" width={20} />
            }
          >
            {t('pin')}
          </DropdownItem>
        )}
        <DropdownItem
          key="delete"
          className="text-danger-500 data-[hover=true]:text-danger-500"
          color="danger"
          startContent={
            <Icon
              className="text-danger-500"
              height={20}
              icon="solar:trash-bin-minimalistic-linear"
              width={20}
            />
          }
        >
          {t('delete')}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default RecentPromptDropdown
