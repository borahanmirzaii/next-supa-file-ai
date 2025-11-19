'use client'

import { useState } from 'react'
import { FileDropzone } from './FileDropzone'
import { UploadProgressList } from './UploadProgress'
import { FileList } from './FileList'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type File = Database['public']['Tables']['files']['Row']

interface FileUploadContainerProps {
  initialFiles: File[]
}

export function FileUploadContainer({ initialFiles }: FileUploadContainerProps) {
  const [files, setFiles] = useState<File[]>(initialFiles)
  const { toast } = useToast()
  const supabase = createClient()

  const { uploadMultiple, uploadQueue, clearQueue, removeFromQueue } = useFileUpload({
    onComplete: (fileId, filePath) => {
      toast({
        title: 'Upload complete',
        description: 'Your file has been uploaded successfully',
      })
      // Refresh files list
      loadFiles()
    },
    onError: (fileId, error) => {
      toast({
        title: 'Upload failed',
        description: error,
        variant: 'destructive',
      })
    },
  })

  async function loadFiles() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFiles(data)
    }
  }

  const handleFilesAccepted = async (newFiles: File[]) => {
    await uploadMultiple(newFiles)
  }

  const handleDelete = async (fileId: string) => {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)

    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'File deleted',
        description: 'The file has been removed',
      })
      setFiles(files.filter(f => f.id !== fileId))
    }
  }

  const handleAnalyze = async (fileId: string) => {
    // Navigate to analysis page
    window.location.href = `/files/${fileId}`
  }

  const handleView = (file: File) => {
    window.location.href = `/files/${file.id}`
  }

  const handleDownload = async (file: File) => {
    const { data } = supabase.storage
      .from('user-files')
      .getPublicUrl(file.storage_path)

    window.open(data.publicUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <FileDropzone onFilesAccepted={handleFilesAccepted} />

      {/* Upload Progress */}
      <UploadProgressList
        uploads={uploadQueue}
        onRemove={removeFromQueue}
        onClear={clearQueue}
      />

      {/* Files Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <FileList
            files={files}
            onDelete={handleDelete}
            onAnalyze={handleAnalyze}
            onDownload={handleDownload}
            onView={handleView}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <FileList
            files={files.filter(f => f.status === 'completed')}
            onDelete={handleDelete}
            onAnalyze={handleAnalyze}
            onDownload={handleDownload}
            onView={handleView}
          />
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          <FileList
            files={files.filter(f => f.status === 'processing' || f.status === 'pending')}
            onDelete={handleDelete}
            onAnalyze={handleAnalyze}
            onDownload={handleDownload}
            onView={handleView}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

