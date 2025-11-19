'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlatformCard } from './PlatformCard'
import { ToolBrowser } from './ToolBrowser'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plug, Wrench } from 'lucide-react'
import type { MCPServer, MCPTool } from '@/types/mcp'

const availablePlatforms: MCPServer[] = [
  { id: 'google', name: 'Google Workspace', platform: 'google', status: 'disconnected' },
  { id: 'notion', name: 'Notion', platform: 'notion', status: 'disconnected' },
  { id: 'jira', name: 'Jira', platform: 'jira', status: 'disconnected' },
  { id: 'github', name: 'GitHub', platform: 'github', status: 'disconnected' },
]

export function PlatformConnector() {
  const [servers, setServers] = useState<MCPServer[]>(availablePlatforms)
  const [tools, setTools] = useState<MCPTool[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    loadIntegrations()
    
    // Check for OAuth callback success/error
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success) {
      toast({
        title: 'Connected successfully',
        description: `${success} has been connected`,
      })
      router.replace('/integrations')
      loadIntegrations()
    }
    
    if (error) {
      toast({
        title: 'Connection failed',
        description: error,
        variant: 'destructive',
      })
      router.replace('/integrations')
    }
  }, [searchParams])

  async function loadIntegrations() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)

    if (integrations) {
      const updatedServers = availablePlatforms.map(platform => {
        const integration = integrations.find(i => i.platform === platform.platform)
        return integration
          ? {
              ...platform,
              id: integration.id,
              status: integration.status,
              credentials: integration.credentials,
              lastSync: integration.last_sync ? new Date(integration.last_sync) : undefined,
              error: integration.error_message || undefined,
            }
          : platform
      })
      setServers(updatedServers)
    }
    
    setLoading(false)
  }

  async function handleConnect(server: MCPServer) {
    // Redirect to OAuth authorization
    window.location.href = `/api/oauth/authorize/${server.platform}`
  }

  async function handleDisconnect(server: MCPServer) {
    const { error } = await supabase
      .from('integrations')
      .update({ status: 'disconnected' })
      .eq('id', server.id)

    if (error) {
      toast({
        title: 'Disconnect failed',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Disconnected',
        description: `${server.name} has been disconnected`,
      })
      loadIntegrations()
    }
  }

  async function handleDelete(server: MCPServer) {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', server.id)

    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Deleted',
        description: `${server.name} integration has been removed`,
      })
      loadIntegrations()
    }
  }

  async function handleExecuteTool(toolId: string, input: any) {
    const tool = tools.find(t => t.id === toolId)
    if (!tool) throw new Error('Tool not found')

    const response = await fetch(`/api/mcp/${tool.serverId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: tool.name,
          arguments: input,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Tool execution failed')
    }

    return await response.json()
  }

  async function loadTools(serverId: string) {
    try {
      const response = await fetch(`/api/mcp/${serverId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/list',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const serverTools: MCPTool[] = (data.result?.tools || []).map((tool: any) => ({
          id: `${serverId}-${tool.name}`,
          serverId,
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          enabled: true,
        }))
        setTools(prev => [...prev, ...serverTools])
      }
    } catch (error) {
      console.error('Failed to load tools:', error)
    }
  }

  useEffect(() => {
    // Load tools for connected servers
    servers
      .filter(s => s.status === 'connected')
      .forEach(server => loadTools(server.id))
  }, [servers])

  if (loading) {
    return <div>Loading integrations...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="platforms" className="w-full">
        <TabsList>
          <TabsTrigger value="platforms" className="gap-2">
            <Plug className="h-4 w-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server) => (
              <PlatformCard
                key={server.id}
                server={server}
                onConnect={() => handleConnect(server)}
                onDisconnect={() => handleDisconnect(server)}
                onDelete={() => handleDelete(server)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          {tools.length > 0 ? (
            <ToolBrowser tools={tools} onExecute={handleExecuteTool} />
          ) : (
            <Card className="p-12 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tools available</h3>
              <p className="text-sm text-muted-foreground">
                Connect a platform to see available tools
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

