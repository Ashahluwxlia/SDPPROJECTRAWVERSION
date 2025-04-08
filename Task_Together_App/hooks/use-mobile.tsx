import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(isDemoMode = false) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isDemoMobile, setIsDemoMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // For demo mode, we can simulate mobile view
    if (isDemoMode) {
      const handleDemoMobileToggle = (e: StorageEvent) => {
        if (e.key === 'demo-mobile-view') {
          setIsDemoMobile(e.newValue === 'true')
        }
      }
      
      // Check if demo mobile view is already set
      const demoMobileView = localStorage.getItem('demo-mobile-view')
      if (demoMobileView) {
        setIsDemoMobile(demoMobileView === 'true')
      }
      
      window.addEventListener('storage', handleDemoMobileToggle)
      return () => window.removeEventListener('storage', handleDemoMobileToggle)
    }
    
    // For real users, use actual device detection
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [isDemoMode])

  // For demo mode, return the simulated mobile state
  if (isDemoMode) {
    return isDemoMobile
  }

  // For real users, return the actual mobile state
  return !!isMobile
}

// Helper function to toggle demo mobile view
export function toggleDemoMobileView() {
  const currentValue = localStorage.getItem('demo-mobile-view')
  const newValue = currentValue === 'true' ? 'false' : 'true'
  localStorage.setItem('demo-mobile-view', newValue)
  
  // Dispatch a storage event to notify other tabs/windows
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'demo-mobile-view',
    newValue,
    oldValue: currentValue,
    storageArea: localStorage
  }))
}
