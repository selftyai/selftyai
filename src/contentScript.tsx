import ReactDOM from 'react-dom'

import ContextMenu from '@/components/ContextMenu'

export const renderSelectionMessage = (
  text: string,
  left: number,
  top: number,
  onClose: () => void
) => {
  const div = document.createElement('div')
  div.className = 'context-menu'
  document.body.appendChild(div)

  ReactDOM.render(<ContextMenu text={text} left={left} top={top} onClose={onClose} />, div)

  return div
}

console.log('Hello from content script!')

renderSelectionMessage('This is a dynamically rendered div!', 100, 100, () => {
  console.log('im from content script content menu')
})
