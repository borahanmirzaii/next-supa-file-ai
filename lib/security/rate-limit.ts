import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyPrefix?: string
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Rate limiter using Redis sliding window
 */
export class RateLimiter {
  private redis: Redis
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.redis = redis
    this.config = config
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix || 'ratelimit'}:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart)

    // Count current requests
    const count = await this.redis.zcard(key)

    if (count >= this.config.maxRequests) {
      // Get oldest request timestamp
      const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
      const retryAfter = oldest.length > 0 
        ? Math.ceil((parseInt(oldest[1]) + this.config.windowMs - now) / 1000)
        : Math.ceil(this.config.windowMs / 1000)

      return {
        success: false,
        remaining: 0,
        reset: now + this.config.windowMs,
        retryAfter,
      }
    }

    // Add current request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`)
    await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000))

    return {
      success: true,
      remaining: this.config.maxRequests - count - 1,
      reset: now + this.config.windowMs,
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix || 'ratelimit'}:${identifier}`
    await this.redis.del(key)
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // File upload: 10 requests per minute
  fileUpload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: 'ratelimit:upload',
  }),

  // AI analysis: 5 requests per minute
  aiAnalysis: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyPrefix: 'ratelimit:analysis',
  }),

  // Chat API: 20 requests per minute
  chat: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyPrefix: 'ratelimit:chat',
  }),

  // General API: 100 requests per minute
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'ratelimit:api',
  }),
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get user ID from auth
  // For now, use IP address as fallback
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  
  // In production, use user ID from auth token
  return ip
}

