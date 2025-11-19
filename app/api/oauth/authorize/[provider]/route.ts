import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthorizationUrl } from '@/lib/oauth/providers'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID()
    
    // Store state in cookie
    const cookieStore = await cookies()
    cookieStore.set(`oauth_state_${params.provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      sameSite: 'lax',
    })

    // Store user ID in state
    cookieStore.set(`oauth_user_${params.provider}`, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      sameSite: 'lax',
    })

    // Get authorization URL
    const authUrl = getAuthorizationUrl(params.provider, state)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth authorization error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}

