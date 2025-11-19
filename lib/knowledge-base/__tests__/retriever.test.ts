import { KnowledgeBaseRetriever } from '../retriever'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/ai/embeddings', () => ({
  generateEmbedding: jest.fn(),
}))

describe('KnowledgeBaseRetriever', () => {
  let retriever: KnowledgeBaseRetriever

  beforeEach(() => {
    retriever = new KnowledgeBaseRetriever()
    jest.clearAllMocks()
  })

  describe('search', () => {
    it('should return empty array for empty query', async () => {
      const results = await retriever.search('', { userId: 'user-id' })
      
      expect(results).toEqual([])
    })

    it('should handle search with file filter', async () => {
      // Mock Supabase response
      const { createClient } = require('@/lib/supabase/server')
      createClient.mockReturnValue({
        rpc: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      const { generateEmbedding } = require('@/lib/ai/embeddings')
      generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3])

      const results = await retriever.search('test query', {
        userId: 'user-id',
        fileIds: ['file-1'],
      })

      expect(Array.isArray(results)).toBe(true)
    })

    it('should filter by similarity threshold', async () => {
      const { createClient } = require('@/lib/supabase/server')
      createClient.mockReturnValue({
        rpc: jest.fn().mockResolvedValue({
          data: [
            { similarity: 0.9, content: 'high similarity' },
            { similarity: 0.5, content: 'low similarity' },
          ],
          error: null,
        }),
      })

      const { generateEmbedding } = require('@/lib/ai/embeddings')
      generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3])

      const results = await retriever.search('test', {
        userId: 'user-id',
        threshold: 0.7,
      })

      // Results should be filtered by threshold
      expect(results.every(r => r.similarity >= 0.7)).toBe(true)
    })
  })

  describe('buildContext', () => {
    it('should build context from search results', () => {
      const results = [
        {
          content: 'Test content 1',
          fileId: 'file-1',
          similarity: 0.9,
        },
        {
          content: 'Test content 2',
          fileId: 'file-2',
          similarity: 0.8,
        },
      ]

      const context = retriever['buildContext'](results, new Map())

      expect(context).toContain('Test content 1')
      expect(context).toContain('Test content 2')
    })

    it('should include file names in context', () => {
      const results = [
        {
          content: 'Test content',
          fileId: 'file-1',
          similarity: 0.9,
        },
      ]

      const fileMap = new Map([['file-1', 'test-file.txt']])
      const context = retriever['buildContext'](results, fileMap)

      expect(context).toContain('test-file.txt')
    })
  })
})

