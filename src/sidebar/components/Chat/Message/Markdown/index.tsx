import { Link } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodePanel from '@/sidebar/components/Chat/Message/CodePanel'

const preprocessMarkdown = (markdownText: string) => {
  const processedText = markdownText
    .replace(/\\\[/g, '$')
    .replace(/\\\]/g, '$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
  // .replace(/\\begin{(?!pmatrix|bmatrix)/g, '\\begin{bmatrix}')
  // .replace(/\\end{(?!pmatrix|bmatrix)/g, '\\end{bmatrix}')
  // .replace(/\\begin{bmatrix}/g, '\\begin{bmatrix}')
  // .replace(/\\end{bmatrix}/g, '\\end{bmatrix}')
  // .replace(/\\begin{pmatrix}/g, '\\begin{pmatrix}')
  // .replace(/\\end{pmatrix}/g, '\\end{pmatrix}')

  return processedText.trim()
}

const remarkMathOptions = {
  singleDollarTextMath: true
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
        a({ href, children }) {
          return (
            <Link href={href} target="_blank" size="sm">
              {children}
            </Link>
          )
        },
        ol({ children }) {
          return <ol className="list-inside list-disc pb-2">{children}</ol>
        },
        p({ children }) {
          return <p className="pb-2">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-inside list-decimal pb-2">{children}</ul>
        },
        li({ children }) {
          return <li className="pb-1">{children}</li>
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
