import { BaseAgent, type AnalysisResult } from './base-agent'

export class CodeAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, 'gemini-2.0-flash-exp')
  }

  async analyze(content: Buffer | string, metadata?: { 
    fileName: string
    language?: string 
  }): Promise<AnalysisResult> {
    const code = typeof content === 'string' ? content : content.toString('utf-8')
    const language = this.detectLanguage(metadata?.fileName || '')

    const prompt = `Analyze this ${language} code and provide structured insights in JSON format:

\`\`\`${language}
${code.slice(0, 50000)}
\`\`\`

Response format (must be valid JSON):
{
  "summary": "What this code does",
  "keyPoints": [
    "Main functionality",
    "Key algorithms or patterns",
    "Dependencies or imports",
    "Potential issues"
  ],
  "insights": [
    {
      "title": "Code Quality",
      "description": "Assessment of code structure, readability, and best practices",
      "importance": "high"
    },
    {
      "title": "Improvements",
      "description": "Suggestions for optimization or refactoring",
      "importance": "medium"
    },
    {
      "title": "Security",
      "description": "Potential security concerns or vulnerabilities",
      "importance": "high"
    }
  ],
  "metadata": {
    "topics": ["${language}", "programming"],
    "language": "${language}"
  }
}

Return ONLY valid JSON.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    
    return this.parseResponse(response.text())
  }

  private detectLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript-react',
      'jsx': 'javascript-react',
      'py': 'python',
      'go': 'golang',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'c++',
      'c': 'c',
      'rb': 'ruby',
      'php': 'php',
    }
    return languageMap[ext || ''] || 'code'
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

