import { useState, useEffect } from 'react'

/**
 * Custom hook that listens to a media query and returns a boolean indicating whether the query matches.
 *
 * @param query - The media query string to evaluate.
 * @returns A boolean value indicating whether the media query matches.
 *
 * @example
 * ```typescript
 * const isLargeScreen = useMediaQuery('(min-width: 1024px)');
 * console.log(isLargeScreen); // true or false based on the screen width
 * ```
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const documentChangeHandler = () => setMatches(mediaQueryList.matches)

    mediaQueryList.addEventListener('change', documentChangeHandler)

    setMatches(mediaQueryList.matches)

    return () => {
      mediaQueryList.removeEventListener('change', documentChangeHandler)
    }
  }, [query])

  return matches
}

export default useMediaQuery
