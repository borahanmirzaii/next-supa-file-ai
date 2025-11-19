'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FileWarning } from 'lucide-react'

export default function FilesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Files page error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start gap-4">
          <FileWarning className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div className="space-y-2 flex-1">
            <h2 className="text-xl font-semibold">
              Failed to load files
            </h2>
            <p className="text-sm text-muted-foreground">
              There was an error loading your files. This could be due to a network issue or a problem with the file storage.
            </p>
          </div>
        </div>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </Card>
    </div>
  )
}
