import { setupRedisConnection, getRedisClient } from "./redis"
import { setupWebSocketServer } from "./websocket-server"
import { initializeCaches } from "./cache"

export async function setupApplication() {
  console.log("🚀 Setting up application...")
  const setupResults = {
    redisConnected: false,
    websocketServerStarted: false,
    cachesInitialized: false,
    timestamp: new Date().toISOString(),
  }

  // Setup Redis connection
  setupResults.redisConnected = await setupRedisConnection()

  if (!setupResults.redisConnected) {
    console.warn("⚠️ Application will run with limited functionality due to Redis connection issues")
  } else {
    console.log("✅ Redis connection established successfully")
    
    // Test Redis connection with a simple operation
    try {
      const redis = getRedisClient()
      await redis.set("app:status", "running")
      console.log("✅ Redis write operation successful")
      
      const status = await redis.get("app:status")
      console.log(`✅ Redis read operation successful: ${status}`)
    } catch (error) {
      console.error("❌ Redis operation test failed:", error)
    }
  }

  // Initialize caches if Redis is connected
  if (setupResults.redisConnected) {
    try {
      await initializeCaches()
      setupResults.cachesInitialized = true
      console.log("✅ Application caches initialized successfully")
    } catch (error) {
      console.error("❌ Failed to initialize caches:", error)
    }
  }

  // Setup WebSocket server if Redis is connected
  if (setupResults.redisConnected) {
    try {
      await setupWebSocketServer()
      setupResults.websocketServerStarted = true
      console.log("✅ WebSocket server started successfully")
    } catch (error) {
      console.error("❌ Failed to start WebSocket server:", error)
    }
  }

  console.log("✅ Application setup complete")
  return setupResults
}

