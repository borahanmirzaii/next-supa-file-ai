import { createClient } from './server'

const BUCKET_NAME = 'user-files'

export async function uploadFile(
  file: File,
  userId: string,
  path?: string
): Promise<{ path: string; error: Error | null }> {
  const supabase = await createClient()
  
  // Generate unique file path
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = path || `${userId}/${timestamp}_${sanitizedName}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    return { path: '', error }
  }

  return { path: data.path, error: null }
}

export async function getFileUrl(path: string): Promise<string> {
  const supabase = await createClient()
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function downloadFile(path: string): Promise<Blob | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path)

  if (error) {
    console.error('Error downloading file:', error)
    return null
  }

  return data
}

export async function deleteFile(path: string): Promise<{ error: Error | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  return { error }
}

