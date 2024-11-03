import { Icon } from '@iconify/react'
import { Link } from '@nextui-org/react'
import { useClipboard } from '@nextui-org/use-clipboard'
import 'katex/dist/katex.min.css'
import { memo, useCallback } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodePanel from '@/sidebar/components/Chat/Message/CodePanel'

const remarkMathOptions = {
  singleDollarTextMath: true
}

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const { copied, copy } = useClipboard()

  const handleCopy = useCallback(
    (value: string) => {
      if (copied) return
      copy(value)
    },
    [copied, copy]
  )

  const components = {
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
    },
    ol: ({ children, ...props }) => {
      return (
        <ol className="ml-4 list-outside list-decimal" {...props}>
          {children}
        </ol>
      )
    },
    li: ({ children, ...props }) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      )
    },
    ul: ({ children, ...props }) => {
      return (
        <ul className="ml-4 list-outside list-decimal" {...props}>
          {children}
        </ul>
      )
    },
    strong: ({ children, ...props }) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      )
    },
    a({ href, children }) {
      return (
        <Link href={href} target="_blank" rel="noopener noreferrer" size="sm">
          {children}
          <Icon icon="akar-icons:link-out" className="ml-1 inline-block" />
        </Link>
      )
    },
    h1: ({ children, ...props }) => {
      return (
        <h1 className="mb-2 mt-6 text-3xl font-semibold" {...props}>
          {children}
        </h1>
      )
    },
    h2: ({ children, ...props }) => {
      return (
        <h2 className="mb-2 mt-6 text-2xl font-semibold" {...props}>
          {children}
        </h2>
      )
    },
    h3: ({ children, ...props }) => {
      return (
        <h3 className="mb-2 mt-6 text-xl font-semibold" {...props}>
          {children}
        </h3>
      )
    },
    h4: ({ children, ...props }) => {
      return (
        <h4 className="mb-2 mt-6 text-lg font-semibold" {...props}>
          {children}
        </h4>
      )
    },
    h5: ({ children, ...props }) => {
      return (
        <h5 className="mb-2 mt-6 text-base font-semibold" {...props}>
          {children}
        </h5>
      )
    },
    h6: ({ children, ...props }) => {
      return (
        <h6 className="mb-2 mt-6 text-sm font-semibold" {...props}>
          {children}
        </h6>
      )
    }
  } as Partial<Components>

  return (
    <ReactMarkdown
      className="break-words prose-p:leading-relaxed prose-pre:p-0"
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      remarkPlugins={[remarkGfm, [remarkMath, remarkMathOptions]]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  )
}

const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

export default Markdown
