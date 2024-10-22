import ContextMenu from '@/pageContent/PageOverlay/ContextMenu'
import { Overlay } from '@/pageContent/PageOverlay/Overlay'
import ProvidersWrapper from '@/pageContent/providers'

const App = () => {
  return (
    <ProvidersWrapper>
      <Overlay>
        <ContextMenu />
      </Overlay>
    </ProvidersWrapper>
  )
}

export default App
