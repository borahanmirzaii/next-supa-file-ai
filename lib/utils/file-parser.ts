import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export class FileParser {
  /**
   * Parse PDF files
   */
  static async parsePDF(file: Blob): Promise<string> {
    // Using pdf-parse on server-side only
    // Client-side: return blob for server processing
    throw new Error('PDF parsing must be done server-side')
  }

  /**
   * Parse DOCX files
   */
  static async parseDOCX(file: Blob): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error('Error parsing DOCX:', error)
      throw new Error('Failed to parse DOCX file')
    }
  }

  /**
   * Parse Excel files (XLSX, XLS)
   */
  static async parseExcel(file: Blob): Promise<{ sheets: Record<string, any[][]> }> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      const sheets: Record<string, any[][]> = {}
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        sheets[sheetName] = data as any[][]
      })

      return { sheets }
    } catch (error) {
      console.error('Error parsing Excel:', error)
      throw new Error('Failed to parse Excel file')
    }
  }

  /**
   * Parse CSV files
   */
  static async parseCSV(file: Blob): Promise<string[][]> {
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const data = lines.map(line => {
        // Simple CSV parser (consider using a library for production)
        return line.split(',').map(cell => cell.trim())
      })
      return data
    } catch (error) {
      console.error('Error parsing CSV:', error)
      throw new Error('Failed to parse CSV file')
    }
  }

  /**
   * Parse text files
   */
  static async parseText(file: Blob): Promise<string> {
    try {
      return await file.text()
    } catch (error) {
      console.error('Error parsing text file:', error)
      throw new Error('Failed to parse text file')
    }
  }

  /**
   * Parse image files (extract metadata)
   */
  static async parseImage(file: Blob): Promise<{ dataUrl: string; type: string; size: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          type: file.type,
          size: file.size,
        })
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  /**
   * Parse JSON files
   */
  static async parseJSON(file: Blob): Promise<any> {
    try {
      const text = await file.text()
      return JSON.parse(text)
    } catch (error) {
      console.error('Error parsing JSON:', error)
      throw new Error('Failed to parse JSON file')
    }
  }

  /**
   * Auto-detect and parse file based on MIME type
   */
  static async parseFile(file: File): Promise<any> {
    const mimeType = file.type

    switch (mimeType) {
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.parseDOCX(file)
      
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return this.parseExcel(file)
      
      case 'text/csv':
        return this.parseCSV(file)
      
      case 'text/plain':
      case 'text/javascript':
      case 'text/typescript':
      case 'application/javascript':
        return this.parseText(file)
      
      case 'application/json':
        return this.parseJSON(file)
      
      case 'image/jpeg':
      case 'image/png':
      case 'image/webp':
        return this.parseImage(file)
      
      case 'application/pdf':
        throw new Error('PDF parsing requires server-side processing')
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`)
    }
  }
}

