import { KnowledgeBaseBuilder } from '../builder'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase/storage', () => ({
  downloadFile: jest.fn(),
}))

jest.mock('@/lib/utils/file-parser', () => ({
  FileParser: {
    parseFile: jest.fn(),
  },
}))

jest.mock('@/lib/ai/embeddings', () => ({
  generateEmbedding: jest.fn(),
  chunkText: jest.fn(),
}))

describe('KnowledgeBaseBuilder', () => {
  let builder: KnowledgeBaseBuilder

  beforeEach(() => {
    builder = new KnowledgeBaseBuilder()
    jest.clearAllMocks()
  })

  describe('chunkText', () => {
    it('should chunk text into smaller pieces', () => {
      const text = 'a'.repeat(2000)
      const chunks = builder['chunkText'](text, 500)
      
      expect(chunks.length).toBeGreaterThan(1)
      expect(chunks.every(chunk => chunk.length <= 500)).toBe(true)
    })

    it('should handle text smaller than chunk size', () => {
      const text = 'Short text'
      const chunks = builder['chunkText'](text, 500)
      
      expect(chunks.length).toBe(1)
      expect(chunks[0]).toBe(text)
    })

    it('should preserve text content when chunking', () => {
      const text = 'This is a test string that should be chunked properly'
      const chunks = builder['chunkText'](text, 20)
      const reconstructed = chunks.join('')
      
      expect(reconstructed).toContain('This is a test')
    })
  })

  describe('build', () => {
    it('should handle empty file content', async () => {
      // Mock empty content
      const { FileParser } = require('@/lib/utils/file-parser')
      FileParser.parseFile.mockResolvedValue('')
      
      // Should not throw error
      await expect(
        builder.build('file-id', 'user-id')
      ).resolves.not.toThrow()
    })

    it('should handle file parsing errors', async () => {
      const { FileParser } = require('@/lib/utils/file-parser')
      FileParser.parseFile.mockRejectedValue(new Error('Parse error'))
      
      await expect(
        builder.build('file-id', 'user-id')
      ).rejects.toThrow('Parse error')
    })
  })
})

