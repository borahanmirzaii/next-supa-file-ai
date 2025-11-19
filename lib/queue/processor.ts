import { createWorker } from './client'
import { deepAnalyzer } from '@/lib/ai/analyzer'
import { fileRepository } from '@/lib/repositories/file-repository'
import { knowledgeRepository } from '@/lib/repositories/knowledge-repository'
import { createClient } from '@/lib/supabase/server'

const worker = createWorker(async (job) => {
  const { fileId, userId } = job.data
  const supabase = await createClient()

  try {
    // Get file record
    const file = await fileRepository.findById(fileId)
    if (!file) {
      throw new Error('File not found')
    }

    // Update status to processing
    await fileRepository.updateStatus(fileId, 'processing')

    // Analyze file
    const analysis = await deepAnalyzer.analyze(
      fileId,
      file.storage_path,
      file.mime_type
    )

    // Save analysis
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('analysis')
      .insert({
        file_id: fileId,
        status: 'completed',
        result: analysis,
        insights: analysis.insights,
        agent_type: 'gemini-flash',
      })
      .select()
      .single()

    if (analysisError) throw analysisError

    // Generate knowledge base chunks
    const content = JSON.stringify(analysis)
    const chunks = await deepAnalyzer.generateKnowledgeBaseChunks(
      content,
      fileId,
      userId
    )

    // Save chunks to knowledge base
    await knowledgeRepository.createBatch(
      chunks.map((chunk, index) => ({
        user_id: userId,
        file_id: fileId,
        content: chunk.content,
        embedding: chunk.embedding,
        chunk_index: index,
        metadata: {},
      }))
    )

    // Update file status to completed
    await fileRepository.updateStatus(fileId, 'completed')

    return { success: true, analysisId: analysisRecord.id }
  } catch (error) {
    await fileRepository.updateStatus(fileId, 'failed')
    throw error
  }
})

export { worker }

