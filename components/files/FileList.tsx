'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileIcon,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Sparkles,
} from 'lucide-react'
import type { Database } from '@/types/supabase'

type File = Database['public']['Tables']['files']['Row']

interface FileListProps {
  files: File[]
  onView?: (file: File) => void
  onDelete?: (fileId: string) => void
  onAnalyze?: (fileId: string) => void
  onDownload?: (file: File) => void
}

export function FileList({ files, onView, onDelete, onAnalyze, onDownload }: FileListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  if (files.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No files yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload your first file to get started
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <Card key={file.id} className="p-4">
          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{file.name}</h3>
                <Badge
                  variant="outline"
                  className={getStatusColor(file.status)}
                >
                  {file.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{file.mime_type.split('/')[1]?.toUpperCase()}</span>
                <span>•</span>
                <span>{formatDate(file.created_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {file.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onView) {
                      onView(file)
                    } else {
                      window.location.href = `/files/${file.id}`
                    }
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Analysis
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onAnalyze && (
                    <DropdownMenuItem onClick={() => onAnalyze(file.id)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze with AI
                    </DropdownMenuItem>
                  )}
                  {onDownload && (
                    <DropdownMenuItem onClick={() => onDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(file.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
