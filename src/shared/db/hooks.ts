import { Dexie } from 'dexie'

import { TimestampedEntity } from '@/shared/db/models'

export function addTimestampHooks<T extends TimestampedEntity, Key>(
  table: Dexie.Table<T, Key>,
  options: {
    createdAtField?: keyof TimestampedEntity & keyof T
    updatedAtField?: keyof TimestampedEntity & keyof T
  } = {}
) {
  const { createdAtField = 'createdAt', updatedAtField = 'updatedAt' } = options

  table.hook('creating', function (_, obj) {
    const now = new Date()
    if (!(createdAtField in obj)) {
      ;(obj as Record<string, unknown>)[createdAtField] = now
    }
    ;(obj as Record<string, unknown>)[updatedAtField] = now
  })

  table.hook('updating', function (modifications) {
    ;(modifications as Record<string, unknown>)[updatedAtField] = new Date()
  })
}
