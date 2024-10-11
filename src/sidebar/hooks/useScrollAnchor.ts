import { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'
import { useCallback, useRef, useState } from 'react'

export const useScrollAnchor = () => {
  const scrollRef = useRef<OverlayScrollbarsComponentRef>(null)

  const [isAtBottom, setIsAtBottom] = useState(true)
  const [needsScroll, setNeedsScroll] = useState(false)

  const scrollToBottom = useCallback(() => {
    const { current } = scrollRef
    const osInstance = current?.osInstance()

    if (!osInstance) {
      return
    }

    const { overflowAmount } = osInstance.state()
    const { scrollOffsetElement } = osInstance.elements()

    scrollOffsetElement.scrollTo({
      top: overflowAmount.y,
      behavior: 'smooth'
    })
    setIsAtBottom(true)
  }, [])

  const handleScroll = useCallback((target: HTMLElement) => {
    const { scrollTop, scrollHeight, clientHeight } = target
    const isAtBottom = scrollHeight - clientHeight <= scrollTop + 1
    const hasScroll = scrollHeight > clientHeight

    setIsAtBottom(isAtBottom)
    setNeedsScroll(hasScroll)
  }, [])

  return {
    scrollRef,
    showScrollToBottom: !isAtBottom && needsScroll,
    scrollToBottom,
    isAtBottom,
    handleScroll
  }
}
