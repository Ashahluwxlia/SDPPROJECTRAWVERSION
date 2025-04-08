import { Server } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { Redis } from "@upstash/redis"
import { parseRedisConnectionString, safeRedisOperation } from "./redis"

let io: Server | null = null

/**
 * Sets up the WebSocket server with Redis adapter
 * This function should be called during application startup
 */
export async function setupWebSocketServer(): Promise<void> {
  // This function is a placeholder for any additional setup needed for the WebSocket server
  // The actual server initialization happens in getSocketIO when a server is provided
  
  console.log("WebSocket server setup completed")
  
  // We could add additional setup tasks here if needed
  // For example, setting up authentication middleware, rate limiting, etc.
}

export function getSocketIO(server?: any) {
  if (!io && server) {
    // Initialize Socket.IO server
    io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_API_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    })

    // Set up Redis adapter for Socket.IO if Redis is available
    try {
      // Try to use Upstash REST API credentials first
      const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
      const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN

      if (upstashRedisRestUrl && upstashRedisRestToken) {
        const pubClient = new Redis({
          url: upstashRedisRestUrl,
          token: upstashRedisRestToken,
        })

        // Create a new instance for subscription
        const subClient = new Redis({
          url: upstashRedisRestUrl,
          token: upstashRedisRestToken,
        })

        io.adapter(createAdapter(pubClient, subClient))
        console.log("Socket.IO Redis adapter initialized with Upstash REST API")
      } else {
        // Fall back to connection string
        const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING

        if (redisUrl) {
          const connectionInfo = parseRedisConnectionString(redisUrl)

          // For Upstash Redis, we need to convert to REST API format
          const pubClient = new Redis({
            url: `https://${connectionInfo.host}`,
            token: connectionInfo.password,
          })

          // Create a new instance for subscription
          const subClient = new Redis({
            url: `https://${connectionInfo.host}`,
            token: connectionInfo.password,
          })

          io.adapter(createAdapter(pubClient, subClient))
          console.log("Socket.IO Redis adapter initialized with connection string")
        } else {
          console.log("Redis connection information not found, Socket.IO will use in-memory adapter")
        }
      }

      // Subscribe to Redis channel for board updates
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING
      const upstashRedisRestUrlCheck = process.env.UPSTASH_REDIS_REST_URL
      const upstashRedisRestTokenCheck = process.env.UPSTASH_REDIS_REST_TOKEN
      
      let redis: Redis | null = null
      
      try {
        redis = new Redis({
          url: upstashRedisRestUrlCheck || `https://${parseRedisConnectionString(redisUrl || "").host}`,
          token: upstashRedisRestTokenCheck || parseRedisConnectionString(redisUrl || "").password,
        })

        // Subscribe to the channel - Upstash Redis has a different API for subscriptions
        // We'll use a polling approach instead
        setInterval(async () => {
          try {
            if (!io) return;
            
            // Get the latest message from the channel
            const message = await redis?.get("board-updates-latest");
            
            if (message) {
              const eventData = JSON.parse(message as string);
              
              // Broadcast the event to all connected clients in the appropriate room
              if (eventData.payload && eventData.payload.boardId) {
                io.to(`board:${eventData.payload.boardId}`).emit(eventData.type, eventData.payload);
              } else {
                io.emit(eventData.type, eventData.payload);
              }
              
              // Clear the message after processing
              await redis?.del("board-updates-latest");
            }
          } catch (error) {
            console.error("Error processing Redis message:", error);
          }
        }, 1000); // Poll every second
      } catch (error) {
        console.error("Failed to subscribe to Redis channel:", error);
      }
    } catch (error) {
      console.error("Failed to initialize Socket.IO Redis adapter:", error);
      console.log("Socket.IO will use in-memory adapter");
    }

    // Handle client connections
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Join board room
      socket.on("join-board", (boardId) => {
        socket.join(`board:${boardId}`);
        console.log(`Client ${socket.id} joined board ${boardId}`);
      });

      // Leave board room
      socket.on("leave-board", (boardId) => {
        socket.leave(`board:${boardId}`);
        console.log(`Client ${socket.id} left board ${boardId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  return io;
}

