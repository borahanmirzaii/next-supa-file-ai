import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { vectorSearch } from '@/lib/knowledge/search'
import { rateLimiters, getRateLimitIdentifier } from '@/lib/security/rate-limit'
import { kbSearchSchema } from '@/lib/security/validation'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const identifier = user.id || getRateLimitIdentifier(request)
    const rateLimit = await rateLimiters.api.checkLimit(identifier)
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: rateLimit.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 60),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.reset),
          },
        }
      )
    }

    // Validate request body
    const body = await request.json()
    let query, fileId, threshold, limit
    
    try {
      const validated = kbSearchSchema.parse(body)
      query = validated.query
      fileId = validated.fileIds?.[0] // Support single fileId for now
      threshold = validated.threshold
      limit = validated.limit
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        )
      }
      throw error
    }

    const results = await vectorSearch(query, {
      userId: user.id,
      fileId,
      threshold,
      limit,
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Knowledge search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

