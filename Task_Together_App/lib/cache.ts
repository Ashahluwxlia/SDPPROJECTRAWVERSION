import { getRedisClient } from "./redis"

/**
 * Initialize application caches
 * This function sets up any necessary cache structures or preloads data
 * that should be available at application startup
 */
export async function initializeCaches(): Promise<void> {
  const redis = getRedisClient()
  
  try {
    // Set up any necessary cache structures
    // For example, we could preload frequently accessed data
    
    // Set a flag to indicate that caches have been initialized
    await redis.set("app:caches-initialized", "true")
    
    console.log("Application caches initialized successfully")
  } catch (error) {
    console.error("Failed to initialize caches:", error)
    throw error
  }
} 