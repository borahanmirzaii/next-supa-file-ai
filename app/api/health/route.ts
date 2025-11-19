import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Redis from 'ioredis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: {
      status: 'healthy' | 'unhealthy'
      responseTime?: number
    }
    redis: {
      status: 'healthy' | 'unhealthy'
      responseTime?: number
    }
    storage: {
      status: 'healthy' | 'unhealthy'
    }
    ai: {
      status: 'healthy' | 'unhealthy'
    }
  }
}

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unhealthy' },
      redis: { status: 'unhealthy' },
      storage: { status: 'unhealthy' },
      ai: { status: 'unhealthy' },
    },
  }

  // Check database
  try {
    const dbStart = Date.now()
    const supabase = await createClient()
    const { error } = await supabase.from('files').select('id').limit(1)
    const dbTime = Date.now() - dbStart
    
    if (!error) {
      health.services.database = {
        status: 'healthy',
        responseTime: dbTime,
      }
    }
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  // Check Redis
  try {
    const redisStart = Date.now()
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    await redis.ping()
    const redisTime = Date.now() - redisStart
    redis.disconnect()
    
    health.services.redis = {
      status: 'healthy',
      responseTime: redisTime,
    }
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  // Check storage
  try {
    const supabase = await createClient()
    const { error } = await supabase.storage.from('user-files').list('', { limit: 1 })
    
    if (!error) {
      health.services.storage = {
        status: 'healthy',
      }
    }
  } catch (error) {
    console.error('Storage health check failed:', error)
  }

  // Check AI (Gemini API)
  try {
    // Simple check - verify API key is set
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      health.services.ai = {
        status: 'healthy',
      }
    }
  } catch (error) {
    console.error('AI health check failed:', error)
  }

  // Determine overall status
  const unhealthyServices = Object.values(health.services).filter(
    s => s.status === 'unhealthy'
  ).length

  if (unhealthyServices === 0) {
    health.status = 'healthy'
  } else if (unhealthyServices <= 2) {
    health.status = 'degraded'
  } else {
    health.status = 'unhealthy'
  }

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}

