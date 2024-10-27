import * as migrationV1 from '@/shared/db/migrations/migration_001'
import * as migrationV2 from '@/shared/db/migrations/migration_002'
import * as migrationV3 from '@/shared/db/migrations/migration_003'
import * as migrationV4 from '@/shared/db/migrations/migration_004'
import * as migrationV5 from '@/shared/db/migrations/migration_005'
import * as migrationV6 from '@/shared/db/migrations/migration_006'
import * as migrationV7 from '@/shared/db/migrations/migration_007'
import * as migrationV8 from '@/shared/db/migrations/migration_008'
import * as migrationV9 from '@/shared/db/migrations/migration_009'

const migrations = [
  migrationV1,
  migrationV2,
  migrationV3,
  migrationV4,
  migrationV5,
  migrationV6,
  migrationV7,
  migrationV8,
  migrationV9
]

export default migrations
