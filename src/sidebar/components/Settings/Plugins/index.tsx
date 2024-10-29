import { Icon } from '@iconify/react'
import { Button, Card, CardBody, cn, Image, Link } from '@nextui-org/react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { useTranslation } from 'react-i18next'

import GooglePluginConfiguration from '@/sidebar/components/Settings/Plugins/GooglePluginConfiguration'
import TavilyPluginConfiguration from '@/sidebar/components/Settings/Plugins/TavilyPluginConfiguration'
import { useTheme } from '@/sidebar/providers/ThemeProvider'
import getIssueRedirect from '@/sidebar/utils/getIssueRedirect'

interface PluginsProps {
  className?: string
}

const Plugins = ({ className, ...props }: PluginsProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const plugins = {
    webSearch: {
      id: 'Web Search',
      name: t('settings.plugins.webSearch.title'),
      icon: 'akar-icons:globe',
      items: [
        {
          id: 'google',
          name: t('settings.plugins.webSearch.google.title'),
          description: t('settings.plugins.webSearch.google.description'),
          icon: <Icon icon="logos:google-icon" className="h-8 w-8" />,
          action: <GooglePluginConfiguration />
        },
        // {
        //   id: 'duckduckgo',
        //   name: (
        //     <span className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center">
        //       {t('settings.plugins.webSearch.duckduckgo.title')}
        //       <Chip
        //         variant="shadow"
        //         classNames={{
        //           base: 'bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30',
        //           content: 'drop-shadow shadow-black text-white'
        //         }}
        //         color="secondary"
        //         radius="sm"
        //       >
        //         {t('comingSoon')}
        //       </Chip>
        //     </span>
        //   ),
        //   description: t('settings.plugins.webSearch.duckduckgo.description'),
        //   icon: <Icon icon="logos:duckduckgo" className="h-8 w-8" />,
        //   action: (
        //     <div className="inline-flex gap-2">
        //       <Button size="sm" variant="faded" isDisabled>
        //         {t('settings.plugins.webSearch.google.action')}
        //       </Button>
        //       <Switch
        //         size="sm"
        //         checked={false}
        //         isDisabled
        //       />
        //     </div>
        //   )
        // },
        {
          id: 'tavily',
          name: t('settings.plugins.webSearch.tavily.title'),
          description: t('settings.plugins.webSearch.tavily.description'),
          icon: (
            <Image
              src="https://www.google.com/s2/favicons?domain=https://tavily.com/&sz=128"
              width="32"
              height="32"
            />
          ),
          action: <TavilyPluginConfiguration />
        }
      ]
    }
    // imageGeneration: {
    //   id: 'Image Generation',
    //   name: (
    //     <span className="flex flex-col-reverse items-start gap-2 space-y-2 sm:flex-row sm:items-center">
    //       {t('settings.plugins.imageGeneration.title')}
    //       <Chip
    //         variant="shadow"
    //         classNames={{
    //           base: 'bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30',
    //           content: 'drop-shadow shadow-black text-white'
    //         }}
    //         color="secondary"
    //         radius="sm"
    //       >
    //         {t('comingSoon')}
    //       </Chip>
    //     </span>
    //   ),
    //   icon: 'fluent:image-sparkle-16-regular',
    //   items: [
    //     {
    //       id: 'dallle',
    //       name: t('settings.plugins.imageGeneration.dallE.title'),
    //       description: t('settings.plugins.imageGeneration.dallE.description'),
    //       icon: <Icon icon="logos:openai-icon" className="h-8 w-8" />,
    //       action: (
    //         <div className="inline-flex gap-2">
    //           <Button size="sm" variant="faded" isDisabled>
    //             {t('settings.plugins.imageGeneration.dallE.action')}
    //           </Button>
    //           <Switch
    //             size="sm"
    //             checked={false}
    //             isDisabled
    //           />
    //         </div>
    //       )
    //     },
    //     {
    //       id: 'stableDiffusion',
    //       name: t('settings.plugins.imageGeneration.stableDiffusion.title'),
    //       description: t('settings.plugins.imageGeneration.stableDiffusion.description'),
    //       icon: <Icon icon="logos:stability-ai-icon" className="h-8 w-8" />,
    //       action: (
    //         <div className="inline-flex gap-2">
    //           <Button size="sm" variant="faded" isDisabled>
    //             {t('settings.plugins.imageGeneration.stableDiffusion.action')}
    //           </Button>
    //           <Switch
    //             size="sm"
    //             checked={false}
    //             isDisabled
    //           />
    //         </div>
    //       )
    //     }
    //   ]
    // }
  }

  return (
    <OverlayScrollbarsComponent
      className={cn('max-h-[75dvh] max-w-4xl px-2', className)}
      options={{
        scrollbars: {
          autoHide: 'scroll',
          theme: theme?.includes('dark') ? 'os-theme-light' : 'os-theme-dark'
        },
        overflow: { x: 'hidden', y: 'scroll' }
      }}
      defer
      {...props}
    >
      <div className="flex flex-col gap-8">
        {Object.keys(plugins).map((key) => {
          const plugin = plugins[key as keyof typeof plugins]
          return (
            <section key={`plugin-${plugin.id}`}>
              <div className="mb-4 flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center">
                <h2 className="inline-flex items-end gap-2 text-large font-semibold sm:items-center">
                  <Icon icon={plugin.icon} className="mb-1 h-6 w-6 sm:mb-0" />
                  {plugin.name}
                </h2>

                <Button
                  as={Link}
                  href={getIssueRedirect({
                    title: `[${plugin.id} Plugins] Request to add new plugin`,
                    body: `
                        **Description**:\n*Enter a description of the plugin you would like our team to add.*
                    `.trim(),
                    labels: ['enhancement']
                  })}
                  target="_blank"
                  size="sm"
                  variant="shadow"
                  color="secondary"
                  startContent={<Icon icon="akar-icons:plus" />}
                >
                  {t('settings.plugins.requestNewPlugin')}
                </Button>
              </div>
              <div className="overflow-hidden rounded-large border bg-background">
                <div className="divide-y">
                  {plugin.items.map((item) => (
                    <Card
                      key={`plugin-${plugin.id}-${item.id}`}
                      radius="none"
                      shadow="none"
                      isHoverable
                    >
                      <CardBody>
                        <div className="flex flex-col items-start justify-between space-x-4 space-y-4 p-4 sm:flex-row sm:items-center">
                          <div className="inline-flex gap-4">
                            {item.icon}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-large font-medium">{item.name}</h3>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          {item.action}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </OverlayScrollbarsComponent>
  )
}

Plugins.displayName = 'Plugins'

export default Plugins
