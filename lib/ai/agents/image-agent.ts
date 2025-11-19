import { BaseAgent, type AnalysisResult } from './base-agent'

export class ImageAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, 'gemini-2.0-flash-exp')
  }

  async analyze(content: Buffer, metadata?: { 
    fileName: string
    mimeType: string 
  }): Promise<AnalysisResult> {
    try {
      // Convert buffer to base64 for inline image
      const base64Image = content.toString('base64')
      const mimeType = metadata?.mimeType || 'image/jpeg'

      const prompt = `Analyze this image in detail and provide structured insights in JSON format:

{
  "summary": "Comprehensive description of what you see",
  "keyPoints": [
    "Main object or subject",
    "Notable details",
    "Context or setting",
    "Visual style or characteristics"
  ],
  "insights": [
    {
      "title": "Visual Analysis",
      "description": "Detailed analysis of composition, colors, etc",
      "importance": "high"
    },
    {
      "title": "Content Identification",
      "description": "Objects, text, or elements detected",
      "importance": "high"
    }
  ],
  "metadata": {
    "topics": ["photography", "nature"],
    "language": "en",
    "sentiment": "positive"
  }
}

Be thorough and specific. Return ONLY valid JSON.`

      const result = await this.model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
        { text: prompt },
      ])

      const response = await result.response
      const text = response.text()

      return this.parseResponse(text)
    } catch (error) {
      console.error('Image analysis error:', error)
      throw error
    }
  }

  private parseResponse(text: string): AnalysisResult {
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/(\{[\s\S]*\})/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        return JSON.parse(jsonStr)
      }

      return this.createFallbackResult(text)
    } catch (error) {
      return this.createFallbackResult(text)
    }
  }
}

