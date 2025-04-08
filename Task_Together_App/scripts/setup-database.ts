import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { setupRedisConnection } from "../lib/redis"

// Check if .env file exists
const envPath = path.join(process.cwd(), ".env")
if (!fs.existsSync(envPath)) {
  console.log("Creating .env file from .env.example...")
  const exampleEnvPath = path.join(process.cwd(), ".env.example")
  if (fs.existsSync(exampleEnvPath)) {
    fs.copyFileSync(exampleEnvPath, envPath)
  } else {
    console.error(".env.example file not found")
    process.exit(1)
  }
}

// Reset database
console.log("Resetting database...")
try {
  execSync("npx prisma db push --force-reset", { stdio: "inherit" })
} catch (error) {
  console.error("Error resetting database:", error)
  process.exit(1)
}

// Run Prisma migrations
console.log("Running Prisma migrations...")
try {
  execSync("npx prisma migrate dev --name init", { stdio: "inherit" })
} catch (error) {
  console.error("Error running migrations:", error)
  process.exit(1)
}

// Generate Prisma client
console.log("Generating Prisma client...")
try {
  execSync("npx prisma generate", { stdio: "inherit" })
} catch (error) {
  console.error("Error generating Prisma client:", error)
  process.exit(1)
}

// Seed the database
console.log("Seeding the database...")
try {
  execSync("npm run prisma:seed", { stdio: "inherit" })
} catch (error) {
  console.error("Error seeding database:", error)
  process.exit(1)
}

// Test Redis connection
console.log("Testing Redis connection...")
setupRedisConnection()
  .then((connected) => {
    if (connected) {
      console.log("Redis connection successful!")
    } else {
      console.warn("Redis connection failed. Some features may not work properly.")
    }
    console.log("Database setup complete!")
  })
  .catch((error) => {
    console.error("Error testing Redis connection:", error)
    console.log("Database setup complete, but Redis connection failed.")
  })

