'use server'

import { createClient } from '@/lib/supabase/server'
import { mcpClient } from '@/lib/mcp/client'
import type { Platform } from '@/lib/mcp/server-factory'
import type { MCPTool } from '@/types/mcp'

export async function refreshIntegrationAction(integrationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', integrationId)
    .eq('user_id', user.id)
    .single()

  if (!integration) throw new Error('Integration not found')

  try {
    const platform = integration.platform as Platform
    
    // Connect to MCP server
    await mcpClient.connect(platform, integration.credentials as Record<string, any>)

    // List tools via MCP
    const toolsResponse = await mcpClient.execute(platform, {
      method: 'tools/list',
      params: {},
    })

    const tools = (toolsResponse as any)?.tools || []

    // Save tools to database
    await supabase.from('mcp_tools').delete().eq('integration_id', integrationId)
    
    if (tools.length > 0) {
      await supabase.from('mcp_tools').insert(
        tools.map((tool: any) => ({
          integration_id: integrationId,
          tool_name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
          enabled: true,
        }))
      )
    }

    // Update integration status
    await supabase
      .from('integrations')
      .update({
        status: 'connected',
        last_sync: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', integrationId)

    return { success: true, toolCount: tools.length }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await supabase
      .from('integrations')
      .update({
        status: 'error',
        error_message: errorMessage,
      })
      .eq('id', integrationId)

    throw error
  }
}

export async function disconnectIntegrationAction(integrationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get integration to get platform
  const { data: integration } = await supabase
    .from('integrations')
    .select('platform')
    .eq('id', integrationId)
    .eq('user_id', user.id)
    .single()

  if (integration) {
    // Disconnect from MCP server
    try {
      await mcpClient.disconnect(integration.platform as Platform)
    } catch {
      // Ignore disconnect errors
    }
  }

  // Delete from database
  await supabase
    .from('integrations')
    .delete()
    .eq('id', integrationId)
    .eq('user_id', user.id)

  return { success: true }
}

export async function getIntegrationToolsAction(integrationId: string): Promise<MCPTool[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: tools } = await supabase
    .from('mcp_tools')
    .select('*')
    .eq('integration_id', integrationId)

  return (tools || []).map(tool => ({
    id: `${integrationId}-${tool.tool_name}`,
    serverId: tool.integration_id,
    name: tool.tool_name,
    description: tool.description,
    inputSchema: tool.input_schema,
    enabled: tool.enabled,
    usageCount: tool.usage_count,
    lastUsed: tool.last_used_at ? new Date(tool.last_used_at) : undefined,
  }))
}

