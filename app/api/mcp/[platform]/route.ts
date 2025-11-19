import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mcpClient } from '@/lib/mcp/client'
import type { Platform } from '@/lib/mcp/server-factory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const platform = params.platform as Platform
    const body = await request.json()
    const { method, params: requestParams } = body

    if (!method) {
      return NextResponse.json(
        { error: 'Method is required' },
        { status: 400 }
      )
    }

    // Get integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('status', 'connected')
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found or not connected' },
        { status: 404 }
      )
    }

    // Connect if not already connected
    if (integration.status !== 'connected') {
      await mcpClient.connect(platform, integration.credentials as Record<string, any>)
    }

    // Execute MCP request
    const response = await mcpClient.execute(platform, {
      method,
      params: requestParams || {},
    })

    return NextResponse.json({ result: response })
  } catch (error) {
    console.error('MCP API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

