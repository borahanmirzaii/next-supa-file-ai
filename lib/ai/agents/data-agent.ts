import { BaseAgent, type AnalysisResult } from './base-agent'
import * as XLSX from 'xlsx'

export class DataAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, 'gemini-2.0-flash-exp')
  }

  async analyze(content: Buffer, metadata?: { 
    mimeType: string 
  }): Promise<AnalysisResult> {
    try {
      // Parse spreadsheet
      const workbook = XLSX.read(content, { type: 'buffer' })
      const analysis = await this.analyzeWorkbook(workbook)
      
      return analysis
    } catch (error) {
      console.error('Data analysis error:', error)
      throw error
    }
  }

  private async analyzeWorkbook(workbook: XLSX.WorkBook): Promise<AnalysisResult> {
    // Extract all sheets
    const sheetsData: Record<string, any[][]> = {}
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      sheetsData[sheetName] = data as any[][]
    })

    // Create summary of data
    const dataDescription = this.summarizeData(sheetsData)

    const prompt = `Analyze this spreadsheet data and provide structured insights in JSON format:

${dataDescription}

Response format (must be valid JSON):
{
  "summary": "Overview of the data",
  "keyPoints": [
    "Number of sheets and records",
    "Main data categories",
    "Data patterns or trends",
    "Data quality observations"
  ],
  "insights": [
    {
      "title": "Data Structure",
      "description": "Description of how data is organized",
      "importance": "high"
    },
    {
      "title": "Key Findings",
      "description": "Notable patterns or insights from the data",
      "importance": "high"
    }
  ],
  "metadata": {
    "topics": ["data", "spreadsheet"],
    "language": "en"
  }
}

Return ONLY valid JSON.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    
    return this.parseResponse(response.text())
  }

  private summarizeData(sheetsData: Record<string, any[][]>): string {
    let summary = `Spreadsheet with ${Object.keys(sheetsData).length} sheet(s):\n\n`
    
    for (const [sheetName, data] of Object.entries(sheetsData)) {
      summary += `Sheet: "${sheetName}"\n`
      summary += `- Rows: ${data.length}\n`
      summary += `- Columns: ${data[0]?.length || 0}\n`
      
      if (data.length > 0) {
        summary += `- Headers: ${JSON.stringify(data[0])}\n`
        summary += `- First 3 rows (sample):\n${JSON.stringify(data.slice(1, 4), null, 2)}\n`
      }
      summary += '\n'
    }
    
    return summary
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

