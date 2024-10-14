import { Button } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import { useTheme } from 'next-themes'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface CodePanelProps {
  language: string
  value: string
}

const CodePanel: FC<CodePanelProps> = memo(({ language, value }) => {
  const { theme } = useTheme()
  const { copied, copy } = useClipboard()
  const { t } = useTranslation()

  const isDark = theme === 'dark'

  const handleCopy = () => {
    if (copied) return
    copy(value)
  }

  return (
    <div className="codeblock group/code-panel relative mb-3 w-full max-w-[65vw] overflow-x-auto rounded-lg bg-content1 font-sans sm:max-w-full">
      <div className="flex items-center justify-between overflow-x-auto rounded-lg px-4 py-2 text-xs">
        <div className="p-1">{language}</div>
        <Button
          radius="lg"
          size="sm"
          variant="light"
          onPress={handleCopy}
          className="hidden h-6 bg-content2 shadow-small group-hover/code-panel:flex"
        >
          {copied ? <p>{t('copied')}</p> : <p>{t('copy')}</p>}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          width: '100%'
        }}
        lineNumberStyle={{
          userSelect: 'none'
        }}
        codeTagProps={{
          style: {
            fontSize: '0.8rem'
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
})

export default CodePanel
