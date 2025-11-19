'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div className="space-y-2 flex-1">
            <h2 className="text-xl font-semibold">
              Failed to load dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred while loading the dashboard.'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono">
                Reference: {error.digest}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} className="flex-1">
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1"
          >
            Reload page
          </Button>
        </div>
      </Card>
    </div>
  )
}
