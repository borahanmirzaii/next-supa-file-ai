import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/supabase/storage'
import { fileRepository } from '@/lib/repositories/file-repository'
import { rateLimiters, getRateLimitIdentifier } from '@/lib/security/rate-limit'
import { fileUploadSchema, sanitizeFileName } from '@/lib/security/validation'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const identifier = user.id || getRateLimitIdentifier(request)
    const rateLimit = await rateLimiters.fileUpload.checkLimit(identifier)
    
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
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.reset),
          },
        }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file data
    try {
      fileUploadSchema.parse({
        name: file.name,
        size: file.size,
        mime_type: file.type,
      })
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

    // Sanitize file name
    const sanitizedName = sanitizeFileName(file.name)

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const { path, error: uploadError } = await uploadFile(file, user.id)

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create file record in database (use sanitized name)
    const fileRecord = await fileRepository.create({
      user_id: user.id,
      name: sanitizedName,
      size: file.size,
      mime_type: file.type,
      storage_path: path,
      status: 'pending',
      metadata: {},
    })

    // Trigger processing (async)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: fileRecord.id }),
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      file: fileRecord,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

