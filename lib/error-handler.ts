import { NextResponse } from 'next/server'
import { logger } from './logger'

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleError(error: unknown, requestId?: string): NextResponse {
  if (error instanceof AppError) {
    logger.warn('Operational error', {
      requestId,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    })

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        requestId,
      },
      { status: error.statusCode }
    )
  }

  // Unexpected error
  logger.error('Unexpected error', error, { requestId })

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      requestId,
    },
    { status: 500 }
  )
}

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

