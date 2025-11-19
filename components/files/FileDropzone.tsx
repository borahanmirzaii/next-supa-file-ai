'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileIcon, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: Record<string, string[]>
  className?: string
}

const DEFAULT_ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'text/javascript': ['.js'],
  'text/typescript': ['.ts'],
  'application/json': ['.json'],
}

export function FileDropzone({
  onFilesAccepted,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  className,
}: FileDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([])

    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((e: any) => {
          if (e.code === 'file-too-large') {
            return `${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`
          }
          if (e.code === 'file-invalid-type') {
            return `${file.name} has invalid file type`
          }
          return `${file.name}: ${e.message}`
        })
        return errorMessages.join(', ')
      })
      setErrors(newErrors)
    }

    if (acceptedFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...acceptedFiles])
    }
  }, [maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes,
    multiple: true,
  })

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesAccepted(selectedFiles)
      setSelectedFiles([])
      setErrors([])
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          'hover:border-primary/50 hover:bg-accent/50',
          isDragActive && 'border-primary bg-accent',
          'p-8 flex flex-col items-center justify-center min-h-[200px]'
        )}
      >
        <input {...getInputProps()} />
        
        <Upload className={cn(
          'h-12 w-12 mb-4 text-muted-foreground transition-colors',
          isDragActive && 'text-primary'
        )} />
        
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, XLSX, images, code files (max {maxSize / 1024 / 1024}MB)
            </p>
          </div>
        )}
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-destructive">{error}</p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              Selected Files ({selectedFiles.length})
            </h3>
            <Button onClick={handleUpload} size="sm">
              Upload All
            </Button>
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-accent"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    {file.type.split('/')[1] || 'unknown'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

