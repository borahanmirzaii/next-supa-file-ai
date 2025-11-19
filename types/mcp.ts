export interface MCPServer {
  id: string
  name: string
  platform: 'google' | 'notion' | 'jira' | 'github'
  status: 'connected' | 'disconnected' | 'error'
  credentials?: any
  config?: any
  lastSync?: Date
  error?: string
}

export interface MCPTool {
  id: string
  serverId: string
  name: string
  description: string
  inputSchema: any
  enabled: boolean
  category?: string
  usageCount?: number
  lastUsed?: Date
}

export interface MCPToolExecution {
  id: string
  toolId: string
  toolName: string
  input: any
  output?: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: string
  startedAt: Date
  completedAt?: Date
}

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

