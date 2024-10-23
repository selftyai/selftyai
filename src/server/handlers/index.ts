import { ExtendedEvent } from '@/server/handlers/PortHandler'
import ContinueMessageHandler from '@/server/handlers/chat/ContinueMessageHandler'
import GenerateMessageHandler from '@/server/handlers/chat/GenerateMessageHandler'
import RegenerateMessageHandler from '@/server/handlers/chat/RegenerateMessageHandler'
import SetMessageContextHandler from '@/server/handlers/chat/SetMessageContextHandler'
import CurrentLanguageHandler from '@/server/handlers/i18n/CurrentLanguageHandler'
import DeleteModelHandler from '@/server/handlers/ollama/DeleteModelHandler'
import PullModelHandler from '@/server/handlers/ollama/PullModelHandler'
import VerifyConnectionHandler from '@/server/handlers/ollama/VerifyConnectionHandler'
import GetContextIsEnableHandler from '@/server/handlers/settings/GetContextIsEnableHandler'
import SetContextIsEnableHandler from '@/server/handlers/settings/SetContextIsEnableHandler'
import SidePanelHandler from '@/server/handlers/sidePanel/SidePanelHandler'
import GetThemeHandler from '@/server/handlers/theme/GetThemeHandler'
import SetThemeHandler from '@/server/handlers/theme/SetThemeHandler'
import { MessageEvent } from '@/server/types/MessageEvent'
import mergeHandlers from '@/server/utils/mergeHandlers'

export function createHandlerChains() {
  return mergeHandlers<ExtendedEvent<unknown>>(
    // Chat handlers
    new ContinueMessageHandler(),
    new GenerateMessageHandler(),
    new RegenerateMessageHandler(),
    new SetMessageContextHandler(),
    // Ollama handlers
    new DeleteModelHandler(),
    new VerifyConnectionHandler(),
    new PullModelHandler(),
    // SidePanel handlers
    new SidePanelHandler()
  )
}

export function createMessageHandlerChain() {
  return mergeHandlers<MessageEvent<unknown>>(
    // Language handlers
    new CurrentLanguageHandler(),
    // Theme handlers
    new GetThemeHandler(),
    new SetThemeHandler(),

    // Settings handlers
    // IsContextEnable handlers
    new GetContextIsEnableHandler(),
    new SetContextIsEnableHandler()
  )
}
