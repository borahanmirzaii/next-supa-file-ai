'use server'

import { createClient } from '@/lib/supabase/server'
import { mcpClient } from '@/lib/mcp/client'
import type { Platform } from '@/lib/mcp/server-factory'

export async function executeToolAction(
  serverId: string,
  toolName: string,
  args: any
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get integration
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', serverId)
    .eq('user_id', user.id)
    .single()

  if (error || !integration) {
    throw new Error('Integration not found')
  }

  if (integration.status !== 'connected') {
    throw new Error('Integration not connected')
  }

  // Connect to MCP server if not already connected
  const platform = integration.platform as Platform
  try {
    await mcpClient.connect(platform, integration.credentials as Record<string, any>)
  } catch {
    // Already connected or connection failed
  }

  // Execute tool via MCP
  const response = await mcpClient.execute(platform, {
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args,
    },
  })

  // Update tool usage count
  await supabase
    .from('mcp_tools')
    .update({
      usage_count: supabase.rpc('increment', { row_id: serverId }).then(() => {
        // Increment usage count
        return supabase
          .from('mcp_tools')
          .select('usage_count')
          .eq('integration_id', serverId)
          .eq('tool_name', toolName)
          .single()
          .then(({ data }) => (data?.usage_count || 0) + 1)
      }),
      last_used_at: new Date().toISOString(),
    })
    .eq('integration_id', serverId)
    .eq('tool_name', toolName)

  // Parse result
  if (response && typeof response === 'object' && 'content' in response) {
    const content = (response as any).content?.[0]?.text
    if (content) {
      try {
        return JSON.parse(content)
      } catch {
        return content
      }
    }
  }

  return response
}

