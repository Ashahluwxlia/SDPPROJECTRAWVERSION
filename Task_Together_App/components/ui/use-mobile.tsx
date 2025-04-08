import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(isDemoMode?: boolean) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // If in demo mode, we'll simulate mobile behavior based on a fixed breakpoint
    if (isDemoMode) {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [isDemoMode])

  return !!isMobile
}
