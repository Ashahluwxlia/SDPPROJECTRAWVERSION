"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface OfflineDetectorProps {
  isDemoMode?: boolean
}

export function OfflineDetector({ isDemoMode }: OfflineDetectorProps) {
  const [isOffline, setIsOffline] = useState(false)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      // If we had pending changes, show a success message
      if (hasPendingChanges) {
        setShowAlert(true)
        // Hide the alert after 5 seconds
        setTimeout(() => setShowAlert(false), 5000)
        // Reset pending changes
        setHasPendingChanges(false)
      }
    }

    const handleOffline = () => {
      setIsOffline(true)
      // Simulate having pending changes when offline
      setHasPendingChanges(true)
    }

    // Check initial state
    setIsOffline(!navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [hasPendingChanges])

  const handleManualSync = () => {
    if (!isOffline) {
      // Simulate syncing
      setHasPendingChanges(false)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 5000)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`bg-amber-500 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2 max-w-md ${isDemoMode ? "border border-dashed border-muted-foreground/30" : ""}`}>
              <WifiOff className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">You are offline</p>
                <p className="text-sm opacity-90">Changes will be saved locally and synced when you reconnect.</p>
              </div>
            </div>
          </motion.div>
        )}

        {showAlert && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Alert className={`bg-green-500 text-white border-green-600 ${isDemoMode ? "border-dashed border-muted-foreground/30" : ""}`}>
              <Wifi className="h-4 w-4" />
              <AlertTitle>Back online!</AlertTitle>
              <AlertDescription>Your changes have been successfully synchronized.</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {hasPendingChanges && !isOffline && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button size="sm" onClick={handleManualSync} className={`bg-amber-500 hover:bg-amber-600 text-white ${isDemoMode ? "border border-dashed border-muted-foreground/30" : ""}`} isDemoMode={isDemoMode}>
            <RefreshCw className="h-4 w-4 mr-2" /> Sync changes
          </Button>
        </div>
      )}
    </>
  )
}

