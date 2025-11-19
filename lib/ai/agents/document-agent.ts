import { BaseAgent, type AnalysisResult } from './base-agent'

export class DocumentAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, 'gemini-2.0-flash-exp')
  }

  async analyze(content: Buffer | string, metadata?: { 
    fileName: string
    mimeType: string 
  }): Promise<AnalysisResult> {
    try {
      // For text-based documents (PDFs and DOCX already extracted to text)
      const text = typeof content === 'string' ? content : content.toString('utf-8')
      return await this.analyzeText(text, metadata)
    } catch (error) {
      console.error('Document analysis error:', error)
      throw error
    }
  }

  private async analyzeText(text: string, metadata?: any): Promise<AnalysisResult> {
    const tokenCount = await this.countTokens(text)
    
    // Truncate if too long (Gemini 2.0 Flash supports 1M tokens, but we'll be safe)
    const maxChars = 100000
    const truncatedText = text.length > maxChars 
      ? text.slice(0, maxChars) + '...[truncated]'
      : text

    const prompt = `Analyze this document and provide a structured analysis in JSON format:

Document Content:
${truncatedText}

Response format (must be valid JSON):
{
  "summary": "Brief 2-3 sentence summary of the document",
  "keyPoints": ["Main point 1", "Main point 2", "Main point 3"],
  "insights": [
    {
      "title": "Insight title",
      "description": "Detailed description",
      "importance": "high"
    }
  ],
  "metadata": {
    "topics": ["topic1", "topic2"],
    "language": "en",
    "sentiment": "positive",
    "wordCount": ${text.split(/\s+/).length}
  }
}

Provide actionable insights and key takeaways. Return ONLY valid JSON.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    
    return this.parseStructuredResponse(response.text())
  }

  private parseStructuredResponse(text: string): AnalysisResult {
    try {
      // Extract JSON from markdown code block or raw text
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/```\s*([\s\S]*?)\s*```/) ||
                       text.match(/(\{[\s\S]*\})/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        const parsed = JSON.parse(jsonStr)
        return parsed as AnalysisResult
      }

      return this.createFallbackResult(text)
    } catch (error) {
      console.error('Error parsing structured response:', error)
      return this.createFallbackResult(text)
    }
  }
}

