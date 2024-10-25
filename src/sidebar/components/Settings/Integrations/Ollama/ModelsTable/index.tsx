import { Icon } from '@iconify/react'
import {
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Chip,
  Tooltip
} from '@nextui-org/react'
import { SearchIcon } from '@nextui-org/shared-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Model } from '@/shared/db/models/Model'
import { useOllama } from '@/sidebar/providers/OllamaProvider'

const columns = [
  { name: 'NAME', uid: 'name', sortable: true },
  { name: 'ACTIONS', uid: 'actions' }
]

const ModelsTable = React.forwardRef<HTMLDivElement>(() => {
  const { deleteModel, models } = useOllama()
  const { t } = useTranslation()

  const [filterValue, setFilterValue] = React.useState('')

  const hasSearchFilter = Boolean(filterValue)

  const filteredItems = React.useMemo(() => {
    if (!models) return []

    let filteredModels = [...models]

    if (hasSearchFilter) {
      filteredModels = filteredModels.filter((model) =>
        model.name.toLowerCase().includes(filterValue.toLowerCase())
      )
    }

    return filteredModels.sort((a, b) => a.name.localeCompare(b.name))
  }, [filterValue, hasSearchFilter, models])

  const renderCell = React.useCallback(
    (model: Model, columnKey: React.Key) => {
      const cellValue = model[columnKey as keyof Model]
      const [name, tag] = model.name.split(':')

      switch (columnKey) {
        case 'name':
          return (
            <div className="flex flex-row items-center gap-2.5">
              <p className="text-bold text-small text-default-500">{name}</p>
              <Chip
                className="gap-1.5"
                color="primary"
                size="sm"
                radius="sm"
                variant="flat"
                startContent={<Icon icon="ph:tag-simple" width={16} />}
              >
                {tag}
              </Chip>
              {model.vision && (
                <Tooltip content={t('settings.integrations.ollama.hasVision')} placement="top">
                  <Chip color="success" size="sm" variant="flat" radius="sm">
                    <Icon icon="solar:eye-linear" width={16} />
                  </Chip>
                </Tooltip>
              )}
              {model.supportTool && (
                <Tooltip content={t('supportToolInvocation')} placement="top">
                  <Chip color="secondary" size="sm" variant="flat" radius="sm">
                    <Icon icon="lucide:toy-brick" width={16} />
                  </Chip>
                </Tooltip>
              )}
            </div>
          )
        case 'actions':
          return (
            <div className="relative flex items-center justify-end gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <Icon className="h-6 w-6 text-default-500" icon="solar:menu-dots-bold" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  onAction={(key) => {
                    const actions = {
                      delete: deleteModel
                    }

                    actions[key as keyof typeof actions](model.model)
                  }}
                >
                  <DropdownItem key="delete">{t('delete')}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        default:
          return cellValue?.toString() || null
      }
    },
    [deleteModel, t]
  )

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value)
    } else {
      setFilterValue('')
    }
  }, [])

  const onClear = React.useCallback(() => {
    setFilterValue('')
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <Input
            isClearable
            className="w-full"
            placeholder={t('settings.integrations.ollama.search')}
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
        </div>
      </div>
    )
  }, [filterValue, onSearchChange, onClear, t])

  return (
    <Card className="border border-default-200 bg-transparent" shadow="none">
      <CardBody>
        <Table
          hideHeader
          isHeaderSticky
          aria-label="Models Table"
          checkboxesProps={{
            classNames: {
              wrapper: ['after:bg-foreground after:text-background text-background']
            }
          }}
          classNames={{
            wrapper: 'max-h-[382px] bg-transparent p-0 border-none shadow-none'
          }}
          topContent={topContent}
          topContentPlacement="outside"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === 'actions' ? 'center' : 'start'}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={t('settings.integrations.ollama.noModels')}
            items={filteredItems}
          >
            {(item) => (
              <TableRow key={item.name}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
})

export default ModelsTable
