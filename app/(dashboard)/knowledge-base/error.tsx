'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Database } from 'lucide-react'

export default function KnowledgeBaseError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Knowledge base error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Database className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div className="space-y-2 flex-1">
            <h2 className="text-xl font-semibold">
              Knowledge base unavailable
            </h2>
            <p className="text-sm text-muted-foreground">
              Failed to load the knowledge base. Please check your connection and try again.
            </p>
          </div>
        </div>
        <Button onClick={reset} className="w-full">
          Retry
        </Button>
      </Card>
    </div>
  )
}
