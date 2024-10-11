import ReactDOM from 'react-dom/client'

import printBuildInfo from '@/shared/printBuildInfo'

import App from './PageOverlay'

printBuildInfo()

const overlayClassName = 'selftyai-overlay'

const overlayDiv = document.createElement('div')
overlayDiv.className = overlayClassName
document.body.appendChild(overlayDiv)
const root = ReactDOM.createRoot(overlayDiv)
root.render(<App />)
