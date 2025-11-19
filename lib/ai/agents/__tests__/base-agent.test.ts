import { BaseAgent } from '../base-agent'
import type { AnalysisResult } from '../base-agent'

// Mock implementation for testing
class TestAgent extends BaseAgent {
  agentType = 'test'
  
  async analyze(file: File, content?: string): Promise<AnalysisResult> {
    return {
      summary: 'Test summary',
      keyPoints: ['Point 1', 'Point 2'],
      insights: { test: 'insight' },
      metadata: { agentType: this.agentType },
    }
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent

  beforeEach(() => {
    agent = new TestAgent()
  })

  describe('token counting', () => {
    it('should count tokens correctly', () => {
      const text = 'This is a test string'
      const count = agent.countTokens(text)
      expect(count).toBeGreaterThan(0)
    })

    it('should handle empty string', () => {
      const count = agent.countTokens('')
      expect(count).toBe(0)
    })

    it('should handle long text', () => {
      const longText = 'a'.repeat(10000)
      const count = agent.countTokens(longText)
      expect(count).toBeGreaterThan(0)
    })
  })

  describe('analysis result structure', () => {
    it('should return valid analysis result', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const result = await agent.analyze(file)
      
      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('keyPoints')
      expect(result).toHaveProperty('insights')
      expect(result).toHaveProperty('metadata')
      expect(result.metadata).toHaveProperty('agentType')
    })

    it('should include agent type in metadata', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const result = await agent.analyze(file)
      
      expect(result.metadata.agentType).toBe('test')
    })
  })
})

