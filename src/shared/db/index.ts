import Dexie from 'dexie'

import { addTimestampHooks } from '@/shared/db/hooks'
import migrations from '@/shared/db/migrations'
import { Branch } from '@/shared/db/models/Branch'
import { Conversation } from '@/shared/db/models/Conversation'
import { File } from '@/shared/db/models/File'
import { Integration } from '@/shared/db/models/Integration'
import { Message } from '@/shared/db/models/Message'
import { Model } from '@/shared/db/models/Model'
import { OllamaPullModel } from '@/shared/db/models/OllamaPullModel'
import { SettingsItem } from '@/shared/db/models/SettingsItem'
import { ToolInvocation } from '@/shared/db/models/ToolInvocation'

class SelftyDatabase extends Dexie {
  models!: Dexie.Table<Model, number>
  conversations!: Dexie.Table<Conversation, number>
  messages!: Dexie.Table<Message, number>
  files!: Dexie.Table<File, number>
  integrations!: Dexie.Table<Integration, number>
  ollamaPullingModels!: Dexie.Table<OllamaPullModel, number>
  settings!: Dexie.Table<SettingsItem, string>
  toolInvocations!: Dexie.Table<ToolInvocation, number>
  branches!: Dexie.Table<Branch, number>

  constructor() {
    super('SelftyDatabase')

    for (const migration of migrations) {
      this.version(migration.version).stores(migration.stores).upgrade(migration.upgrade)
    }

    this.applyHooks()
  }

  private applyHooks() {
    addTimestampHooks(this.models)
    addTimestampHooks(this.messages)
    addTimestampHooks(this.conversations)
    addTimestampHooks(this.files)
    addTimestampHooks(this.integrations)
    addTimestampHooks(this.ollamaPullingModels)
    addTimestampHooks(this.toolInvocations)
  }
}

export const db = new SelftyDatabase()
