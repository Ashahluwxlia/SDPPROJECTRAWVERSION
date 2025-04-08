import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { setAuthCookie, getAuthToken, removeAuthCookie } from './auth.server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

const TOKEN_NAME = 'auth_token'

export async function createToken(payload: any): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
    return token
  } catch (error) {
    console.error('Error creating JWT:', error)
    throw new Error('Failed to create authentication token')
  }
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Error verifying JWT:', error)
    throw new Error('Invalid or expired token')
  }
}

export async function validateToken(): Promise<any> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }
    return await verifyToken(token)
  } catch (error) {
    console.error('Error validating token:', error)
    throw new Error('Authentication failed')
  }
}