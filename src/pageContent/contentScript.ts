import { ServerEndpoints } from '@/shared/types/ServerEndpoints'

console.log(
  'Hello from content script!',
  'endpoints',
  ServerEndpoints,
  'browser',
  process.env.BROWSER
)
