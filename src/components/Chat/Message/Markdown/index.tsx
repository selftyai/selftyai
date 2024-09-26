import { useClipboard } from '@nextui-org/use-clipboard'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodePanel from '@/components/Chat/Message/CodePanel'

const preprocessMarkdown = (markdownText: string) => {
  const processedText = markdownText
    // .replace(/\\\[/g, '$$')
    // .replace(/\\\]/g, '$$')
    // .replace(/\\\(/g, '$$')
    // .replace(/\\\)/g, '$$')
    // .replace(/\\begin{(?!pmatrix|bmatrix)/g, '\\begin{bmatrix}')
    // .replace(/\\end{(?!pmatrix|bmatrix)/g, '\\end{bmatrix}')
    // .replace(/\\begin{bmatrix}/g, '\\begin{bmatrix}')
    // .replace(/\\end{bmatrix}/g, '\\end{bmatrix}')
    // .replace(/\\begin{pmatrix}/g, '\\begin{pmatrix}')
    // .replace(/\\end{pmatrix}/g, '\\end{pmatrix}')
    .replace(/\\n/g, '\n')

  return processedText.trim()
}

const remarkMathOptions = {
  singleDollarTextMath: false
}

const MessageMarkdown = ({ message }: { message: string }) => {
  const { copied, copy } = useClipboard()

  const handleCopy = (value: string) => {
    if (copied) return
    copy(value)
  }

  return (
    <ReactMarkdown
      className="break-words prose-p:leading-relaxed prose-pre:p-0"
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      remarkPlugins={[remarkGfm, [remarkMath, remarkMathOptions]]}
      children={preprocessMarkdown(message)}
      components={{
        p({ children }) {
          return (
            <div suppressHydrationWarning className="mb-2 last:mb-0">
              {children}
            </div>
          )
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')

          if (!match) {
            return (
              <code
                className="codespan cursor-pointer"
                onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
              >
                {children}
              </code>
            )
          }

          return (
            <CodePanel
              key={Math.random()}
              language={(match && match[1]) || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          )
        }
      }}
    />
  )
}

export default MessageMarkdown
