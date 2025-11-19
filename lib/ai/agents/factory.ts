import { BaseAgent } from './base-agent'
import { DocumentAgent } from './document-agent'
import { ImageAgent } from './image-agent'
import { CodeAgent } from './code-agent'
import { DataAgent } from './data-agent'

export class AgentFactory {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  createAgent(mimeType: string): BaseAgent {
    // Document agents
    if (mimeType === 'application/pdf') {
      return new DocumentAgent(this.apiKey)
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return new DocumentAgent(this.apiKey)
    }

    if (mimeType === 'text/plain') {
      return new DocumentAgent(this.apiKey)
    }

    // Image agents
    if (mimeType.startsWith('image/')) {
      return new ImageAgent(this.apiKey)
    }

    // Code agents
    if (this.isCodeFile(mimeType)) {
      return new CodeAgent(this.apiKey)
    }

    // Data agents
    if (this.isDataFile(mimeType)) {
      return new DataAgent(this.apiKey)
    }

    // Default to document agent
    return new DocumentAgent(this.apiKey)
  }

  private isCodeFile(mimeType: string): boolean {
    const codeTypes = [
      'text/javascript',
      'text/typescript',
      'application/javascript',
      'application/typescript',
      'text/x-python',
      'text/x-java',
      'text/x-go',
      'text/x-rust',
      'application/json',
    ]
    return codeTypes.includes(mimeType)
  }

  private isDataFile(mimeType: string): boolean {
    const dataTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]
    return dataTypes.includes(mimeType)
  }
}

