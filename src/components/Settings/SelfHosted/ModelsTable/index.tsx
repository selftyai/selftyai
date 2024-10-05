import { Icon } from '@iconify/react'
import type { ChipProps } from '@nextui-org/react'
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
  Chip
} from '@nextui-org/react'
import { SearchIcon } from '@nextui-org/shared-icons'
import React from 'react'

import { Model } from '@/types/Model'

interface ModelsTableProps {
  className?: string
  models: Model[]
  onModelDelete: (model: Model) => Promise<void>
}
const statusColorMap: Record<string, ChipProps['color']> = {
  active: 'success',
  inactive: 'danger'
}

const columns = [
  { name: 'NAME', uid: 'name', sortable: true },
  { name: 'HAS VISION', uid: 'vision', sortable: true },
  { name: 'ACTIONS', uid: 'actions' }
]

const ModelsTable = React.forwardRef<HTMLDivElement, ModelsTableProps>(
  ({ models, onModelDelete }) => {
    const [filterValue, setFilterValue] = React.useState('')

    const hasSearchFilter = Boolean(filterValue)

    const filteredItems = React.useMemo(() => {
      let filteredUsers = [...models]

      if (hasSearchFilter) {
        filteredUsers = filteredUsers.filter((user) =>
          user.name.toLowerCase().includes(filterValue.toLowerCase())
        )
      }

      return filteredUsers
    }, [filterValue, hasSearchFilter, models])

    const renderCell = React.useCallback((model: Model, columnKey: React.Key) => {
      const cellValue = model[columnKey as keyof Model]

      switch (columnKey) {
        case 'name':
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize text-default-500">{cellValue}</p>
            </div>
          )
        case 'vision':
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[model.hasVision ? 'active' : 'inactive']}
              size="sm"
              variant="flat"
            >
              {model.hasVision ? 'Has vision' : 'No vision'}
            </Chip>
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
                  onAction={async (key) => {
                    switch (key) {
                      case 'delete':
                        await onModelDelete(model)
                        break

                      default:
                        break
                    }
                  }}
                >
                  <DropdownItem key="delete">Delete</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        default:
          return cellValue
      }
    }, [])

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
              placeholder="Search by tag name..."
              startContent={<SearchIcon />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>
        </div>
      )
    }, [filterValue, onSearchChange, onClear])

    return (
      <Card className={'border border-default-200 bg-transparent'} shadow="none">
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
            <TableBody emptyContent={'No models found'} items={filteredItems}>
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
  }
)

export default ModelsTable
