import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type File = Database['public']['Tables']['files']['Row']
type FileInsert = Database['public']['Tables']['files']['Insert']
type FileUpdate = Database['public']['Tables']['files']['Update']

export class FileRepository {
  private async getClient() {
    return await createClient()
  }

  async create(file: FileInsert): Promise<File> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('files')
      .insert(file)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async findById(id: string): Promise<File | null> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<File[]> {
    const supabase = await this.getClient()
    
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async update(id: string, updates: FileUpdate): Promise<File> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getClient()
    
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    await this.update(id, { status })
  }
}

export const fileRepository = new FileRepository()

