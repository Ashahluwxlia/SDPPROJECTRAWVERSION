"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export function useWebSocket(boardId?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize socket connection if it doesn't exist
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin
      
      socket = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket"],
      })
    }

    // Set up event listeners
    const onConnect = () => {
      setIsConnected(true)
      setError(null)
      
      // Join board room if boardId is provided
      if (boardId) {
        socket?.emit("join-board", boardId)
      }
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    const onError = (err: Error) => {
      setError(err.message)
      setIsConnected(false)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onError)

    // Clean up
    return () => {
      socket?.off("connect", onConnect)
      socket?.off("disconnect", onDisconnect)
      socket?.off("connect_error", onError)
      
      // Leave board room if boardId is provided
      if (boardId) {
        socket?.emit("leave-board", boardId)
      }
    }
  }, [boardId])

  // Function to subscribe to events
  const subscribe = <T>(event: string, callback: (data: T) => void) => {
    socket?.on(event, callback)
    
    return () => {
      socket?.off(event, callback)
    }
  }

  // Function to emit events
  const emit = (event: string, data: any) => {
    if (isConnected) {
      socket?.emit(event, data)
      return true
    }
    return false
  }

  return {
    isConnected,
    error,
    subscribe,
    emit,
  }
}

