interface SignInData {
  email: string
  password: string
  isDemoMode?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
}

export async function loginUser(
  email: string,
  password: string,
  isDemoMode = false,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, isDemoMode }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Login failed. Please check your credentials.",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}

export async function registerUser({ name, email, password }: RegisterData): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      console.error("Registration failed:", data.message)
      return false
    }

    return true
  } catch (error) {
    console.error("Registration error:", error)
    return false
  }
}

export async function signOut(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Logout failed")
    }

    return true
  } catch (error) {
    console.error("Logout error:", error)
    return false
  }
}

// Check if user is in demo mode (client-side)
export function isDemoMode(): boolean {
  if (typeof document === "undefined") return false

  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === "demo_mode" && value === "true") {
      return true
    }
  }
  return false
}

// Get user profile information
export async function getUserProfile(): Promise<any> {
  try {
    const response = await fetch("/api/auth/profile")

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}
