import ReactDOM from 'react-dom'

import App from '@/components/PageOverlay'

console.log('Hello from content script!')

const overlayClassName = 'selftyai-overlay'

const overlayDiv = document.createElement('div')
overlayDiv.className = overlayClassName
document.body.appendChild(overlayDiv)
ReactDOM.render(<App />, overlayDiv)
