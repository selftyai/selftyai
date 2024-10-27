import { Tooltip, TooltipProps } from '@nextui-org/react'
import React from 'react'

import { usePageOverlayRef } from '@/pageContent/providers/PageOverlayRefProvider'

/**
 * CustomTooltip is a wrapper around the Tooltip component from '@nextui-org/react'.
 * This component ensures that tooltips are rendered inside the shadow root of the application.
 * It achieves this by using a custom portal container provided by the PageOverlayRefProvider.
 *
 * @param {Omit<TooltipProps, 'portalContainer'>} props - The properties to pass to the Tooltip component, excluding 'portalContainer'.
 * @returns {JSX.Element} The rendered Tooltip component with the custom portal container.
 */
const CustomTooltip: React.FC<Omit<TooltipProps, 'portalContainer'>> = ({ children, ...props }) => {
  const { pageOverlayRef } = usePageOverlayRef()

  return (
    <Tooltip {...props} portalContainer={pageOverlayRef.current ?? undefined}>
      {children}
    </Tooltip>
  )
}

export default CustomTooltip
