import { createRoot } from 'react-dom/client'

import App from '@/pageContent/PageOverlay'
import { PageOverlayRefProvider } from '@/pageContent/providers/PageOverlayRefProvider'
import '@/shared/i18n'

// Create overlay container
const container = document.createElement('div')
container.id = 'shadow-root-selftyai'
document.body.appendChild(container)
const shadowRoot = container.attachShadow({ mode: 'open' })

// Inject styles
const linkEl = document.createElement('link')
linkEl.setAttribute('rel', 'stylesheet')
linkEl.setAttribute('href', chrome.runtime.getURL('assets/styles/overlay.css'))
shadowRoot.appendChild(linkEl)

// Render overlay
const root = createRoot(shadowRoot)
root.render(
  <PageOverlayRefProvider>
    <App />
  </PageOverlayRefProvider>
)
