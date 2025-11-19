import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type KnowledgeEntry = Database['public']['Tables']['knowledge_base']['Row']
type KnowledgeInsert = Database['public']['Tables']['knowledge_base']['Insert']

export class KnowledgeRepository {
  private async getClient() {
    return await createClient()
  }

  async create(entry: KnowledgeInsert): Promise<KnowledgeEntry> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createBatch(entries: KnowledgeInsert[]): Promise<KnowledgeEntry[]> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(entries)
      .select()

    if (error) throw error
    return data || []
  }

  async search(
    queryEmbedding: number[],
    options?: {
      userId?: string
      fileId?: string
      threshold?: number
      limit?: number
    }
  ) {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: options?.threshold || 0.7,
      match_count: options?.limit || 10,
      filter_user_id: options?.userId || null,
      filter_file_id: options?.fileId || null,
    })

    if (error) throw error
    return data || []
  }

  async findByFileId(fileId: string): Promise<KnowledgeEntry[]> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('file_id', fileId)
      .order('chunk_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  async deleteByFileId(fileId: string): Promise<void> {
    const supabase = await this.getClient()
    
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('file_id', fileId)

    if (error) throw error
  }
}

export const knowledgeRepository = new KnowledgeRepository()

