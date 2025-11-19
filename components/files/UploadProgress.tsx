'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react'
import type { FileUploadProgress } from '@/types/file'
import { cn } from '@/lib/utils'

interface UploadProgressListProps {
  uploads: FileUploadProgress[]
  onRemove?: (fileId: string) => void
  onClear?: () => void
}

export function UploadProgressList({ uploads, onRemove, onClear }: UploadProgressListProps) {
  if (uploads.length === 0) return null

  const hasCompleted = uploads.some(u => u.status === 'completed')
  const hasErrors = uploads.some(u => u.status === 'error')

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Upload Progress</h3>
        {(hasCompleted || hasErrors) && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {uploads.map((upload) => (
          <UploadProgressItem
            key={upload.fileId}
            upload={upload}
            onRemove={onRemove}
          />
        ))}
      </div>
    </Card>
  )
}

interface UploadProgressItemProps {
  upload: FileUploadProgress
  onRemove?: (fileId: string) => void
}

function UploadProgressItem({ upload, onRemove }: UploadProgressItemProps) {
  const getStatusIcon = () => {
    switch (upload.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (upload.status) {
      case 'completed':
        return 'Completed'
      case 'error':
        return upload.error || 'Failed'
      case 'uploading':
        return `Uploading... ${upload.progress}%`
      case 'processing':
        return 'Processing...'
      default:
        return 'Pending'
    }
  }

  return (
    <div className={cn(
      'p-3 rounded-lg border',
      upload.status === 'error' && 'border-destructive bg-destructive/10',
      upload.status === 'completed' && 'border-green-500/50 bg-green-500/10'
    )}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{upload.fileName}</p>
          <p className="text-xs text-muted-foreground">{getStatusText()}</p>
        </div>

        {onRemove && (upload.status === 'completed' || upload.status === 'error') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(upload.fileId)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {upload.status === 'uploading' && (
        <Progress value={upload.progress} className="mt-2" />
      )}
    </div>
  )
}

