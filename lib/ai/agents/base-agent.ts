import { GoogleGenerativeAI } from '@google/generative-ai'

export interface AnalysisResult {
  summary: string
  keyPoints: string[]
  insights: {
    title: string
    description: string
    importance: 'low' | 'medium' | 'high'
  }[]
  metadata: {
    topics: string[]
    language: string
    sentiment?: 'positive' | 'neutral' | 'negative'
    wordCount?: number
    pageCount?: number
  }
  rawResponse?: any
}

export abstract class BaseAgent {
  protected genAI: GoogleGenerativeAI
  protected model: any

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash-exp') {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    })
  }

  /**
   * Main analysis method - to be implemented by each agent
   */
  abstract analyze(content: Buffer | string, metadata?: any): Promise<AnalysisResult>

  /**
   * Extract structured data from AI response
   */
  protected async generateStructuredAnalysis(
    prompt: string,
    content?: any[]
  ): Promise<AnalysisResult> {
    try {
      const fullContent = content 
        ? [...content, { text: prompt }]
        : [{ text: prompt }]

      const result = await this.model.generateContent(fullContent)
      const response = await result.response
      const text = response.text()

      // Parse JSON response
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/(\{[\s\S]*\})/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        return JSON.parse(jsonStr)
      }

      // Fallback: create basic structure
      return this.createFallbackResult(text)
    } catch (error) {
      console.error('Error generating structured analysis:', error)
      throw error
    }
  }

  /**
   * Create fallback result if structured parsing fails
   */
  protected createFallbackResult(text: string): AnalysisResult {
    return {
      summary: text.slice(0, 500),
      keyPoints: [text.slice(0, 200)],
      insights: [{
        title: 'Analysis',
        description: text.slice(0, 300),
        importance: 'medium' as const,
      }],
      metadata: {
        topics: [],
        language: 'en',
      },
    }
  }

  /**
   * Count tokens in content
   */
  async countTokens(text: string): Promise<number> {
    const result = await this.model.countTokens(text)
    return result.totalTokens
  }
}

