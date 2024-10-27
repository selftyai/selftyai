import { Icon } from '@iconify/react'
import { Image, Link, Tooltip } from '@nextui-org/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useTranslation } from 'react-i18next'

import { ToolInvocation } from '@/shared/db/models/ToolInvocation'
import { useTheme } from '@/sidebar/providers/ThemeProvider'

interface SearchToolResponse {
  title: string
  content: string
  url: string
}

interface ToolInvocationItemProps {
  invocation: ToolInvocation
}

const ToolInvocationItem: React.FC<ToolInvocationItemProps> = ({ invocation }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const parsedOutput = ['loading', 'error'].includes(invocation.status)
    ? []
    : (JSON.parse(invocation.output || '[]') as SearchToolResponse[])

  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex items-center gap-2">
        <div className="rounded-md bg-content3 p-1">
          <Icon icon="akar-icons:globe" className="h-4 w-4 rounded-small text-foreground" />
        </div>
        <p className="text-base font-semibold">{t('webSearchResults')}</p>
        <Tooltip content={invocation.input} placement="top">
          <Icon icon="akar-icons:info" className="h-4 w-4 text-content3-foreground/80" />
        </Tooltip>
      </div>
      <OverlayScrollbarsComponent
        options={{
          scrollbars: {
            visibility: 'auto',
            autoHide: 'never',
            theme: theme?.includes('dark') ? 'os-theme-light' : 'os-theme-dark'
          },
          overflow: { x: 'scroll', y: 'hidden' }
        }}
        defer
        className="flex flex-col items-start justify-start gap-3"
      >
        <div className="mb-4 flex flex-row items-stretch justify-start gap-2">
          {invocation.status === 'error' && (
            <div className="group relative flex w-full flex-col gap-2 rounded-medium border border-danger-100 bg-content2 bg-danger-100/50 px-4 py-3 text-foreground sm:flex-row">
              <div className="text-small">{invocation.error}</div>
            </div>
          )}
          {invocation.status === 'loading' && (
            <div className="group relative flex w-full flex-col gap-2 rounded-medium border border-primary-100 bg-content2 bg-primary-100/50 px-4 py-3 text-foreground sm:flex-row">
              <div className="text-small">{t('searchingForWeb')}</div>
            </div>
          )}
          {parsedOutput.map((result, index) => {
            const domain = new URL(result.url).hostname
            return (
              <Link
                key={`${invocation.runId}-${index}`}
                target="_blank"
                rel="noreferrer"
                href={result.url}
                className="flex !min-w-[200px] cursor-pointer flex-col items-start justify-between gap-2 rounded-md bg-content3 p-2.5 hover:opacity-80"
              >
                <div className="flex flex-row items-center justify-start gap-2">
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                    width="32"
                    height="32"
                  />
                  <p className="!my-0 line-clamp-1 w-full truncate text-xs font-medium text-content3-foreground">
                    {domain}
                  </p>
                </div>
                <p className="!my-0 line-clamp-2 text-xs font-normal text-content3-foreground/80">
                  {result.title}
                </p>
              </Link>
            )
          })}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  )
}

export default ToolInvocationItem
