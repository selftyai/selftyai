import { Icon } from '@iconify/react'
import { Button, Link } from '@nextui-org/react'
import { Component, ErrorInfo, ReactNode } from 'react'
import { withTranslation, WithTranslationProps } from 'react-i18next'

import getIssueRedirect from '@/sidebar/utils/getIssueRedirect'

interface ErrorBoundaryProps extends WithTranslationProps {
  children?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorStack?: string | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ errorStack: errorInfo.componentStack })
  }

  public render() {
    if (this.state.hasError) {
      const { i18n } = this.props

      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="inline-flex items-center gap-2">
              <Icon
                icon="akar-icons:triangle-alert"
                width={40}
                height={40}
                className="text-danger"
              />
              <h1 className="text-2xl font-bold">{i18n?.t('error.title')}</h1>
            </div>

            <div className="relative w-[80vw] max-w-[600px] rounded-medium border border-danger-100 bg-content2 bg-danger-100/50 px-4 py-3 text-foreground">
              {this.state.errorStack}
            </div>

            <div className="inline-flex gap-3">
              <Button
                variant="flat"
                color="primary"
                size="md"
                startContent={<Icon icon="akar-icons:arrow-cycle" />}
                onClick={() => window.location.reload()}
              >
                {i18n?.t('error.reloadPage')}
              </Button>
              <Button
                as={Link}
                target="_blank"
                rel="noopener noreferrer"
                variant="flat"
                color="danger"
                size="md"
                startContent={<Icon icon="mingcute:horn-line" />}
                href={getIssueRedirect({
                  title: `[Bug] Unhandled error`,
                  body: '**Error stack**: \n```' + this.state.errorStack || '' + '\n```\n',
                  labels: ['bug']
                })}
              >
                {i18n?.t('error.reportABug')}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export default withTranslation()(ErrorBoundary)
