import { generateObject } from 'ai'
import { defaultAnalysisModel } from './config'
import { generateEmbedding, chunkText } from './embeddings'
import { z } from 'zod'
import { downloadFile } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/server'

// Analysis result schema
const analysisSchema = z.object({
  summary: z.string().describe('Brief summary of the file content'),
  keyPoints: z.array(z.string()).describe('Key points or findings from the file'),
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    importance: z.enum(['low', 'medium', 'high']),
  })).describe('Actionable insights derived from the content'),
  metadata: z.object({
    topics: z.array(z.string()).describe('Main topics or themes'),
    language: z.string().describe('Primary language of the content'),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  }),
  entities: z.array(z.object({
    name: z.string(),
    type: z.string(),
    context: z.string().optional(),
  })).describe('Named entities found in the content'),
  relationships: z.array(z.object({
    source: z.string(),
    target: z.string(),
    type: z.string(),
    strength: z.number().min(0).max(1),
  })).describe('Relationships between entities'),
})

export type AnalysisResult = z.infer<typeof analysisSchema>

export class DeepAnalyzer {
  async analyze(fileId: string, filePath: string, mimeType: string): Promise<AnalysisResult> {
    // Download file content
    const blob = await downloadFile(filePath)
    if (!blob) {
      throw new Error('Failed to download file')
    }

    // Extract text content based on file type
    const content = await this.extractContent(blob, mimeType)

    // Generate structured analysis
    const analysis = await generateObject({
      model: defaultAnalysisModel,
      schema: analysisSchema,
      prompt: `Analyze the following file content and provide structured insights:

File Type: ${mimeType}

Content:
${content.slice(0, 50000)}`, // Limit to ~50k chars
      temperature: 0.3,
      maxRetries: 3,
    })

    return analysis.object
  }

  async extractContent(blob: Blob, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const data = await pdfParse(buffer)
      return data.text
    }

    if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      const mammoth = await import('mammoth')
      const arrayBuffer = await blob.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    }

    if (mimeType.includes('spreadsheetml') || mimeType === 'text/csv') {
      const XLSX = await import('xlsx')
      const arrayBuffer = await blob.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const text = workbook.SheetNames.map((name: string) => {
        const sheet = workbook.Sheets[name]
        return XLSX.utils.sheet_to_txt(sheet)
      }).join('\n\n')
      return text
    }

    // Default: text files
    return await blob.text()
  }

  async generateKnowledgeBaseChunks(
    content: string,
    fileId: string,
    userId: string
  ): Promise<Array<{ content: string; embedding: number[]; chunkIndex: number }>> {
    const chunks = chunkText(content, 1000, 200)
    const embeddings = await Promise.all(
      chunks.map(chunk => generateEmbedding(chunk))
    )

    return chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      chunkIndex: index,
    }))
  }
}

export const deepAnalyzer = new DeepAnalyzer()

