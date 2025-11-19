import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Set CSRF token in cookie
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CSRF_TOKEN_EXPIRY / 1000,
  })
  
  return token
}

/**
 * Verify CSRF token from request
 */
export async function verifyCSRFToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)
  
  if (!cookieToken || !headerToken) {
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  )
}

/**
 * Get CSRF token for client-side use
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_COOKIE)?.value || null
}

