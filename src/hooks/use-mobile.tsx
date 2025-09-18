import * as React from "react"

const MOBILE_BREAKPOINT = 1024
const TABLET_BREAKPOINT = 1280

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === 'undefined') return false
    const initialIsMobile = window.innerWidth < 768
    return initialIsMobile
  })

  React.useEffect(() => {
    const initialIsMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false
    setIsMobile(initialIsMobile)

    const mql = window.matchMedia('(max-width: 767px)')
    const onChange = () => {
      const newIsMobile = mql.matches
      setIsMobile(newIsMobile)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const result = !!isMobile

  return result
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    const width = window.innerWidth
    setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setScreenSize('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    const mql1 = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const mql2 = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    
    mql1.addEventListener("change", updateScreenSize)
    mql2.addEventListener("change", updateScreenSize)
    updateScreenSize()
    
    return () => {
      mql1.removeEventListener("change", updateScreenSize)
      mql2.removeEventListener("change", updateScreenSize)
    }
  }, [])

  return screenSize
}
