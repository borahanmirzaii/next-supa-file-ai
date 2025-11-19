import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { FileUploadContainer } from '@/components/files/FileUploadContainer'
import { Skeleton } from '@/components/ui/skeleton'

export default async function FilesPage() {
  const supabase = await createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in</div>
  }

  // Fetch user files
  const { data: files, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Files</h1>
        <p className="text-muted-foreground">
          Upload and manage your documents, images, and data files
        </p>
      </div>

      <Suspense fallback={<FilesPageSkeleton />}>
        <FileUploadContainer initialFiles={files || []} />
      </Suspense>
    </div>
  )
}

function FilesPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

