import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken } from '@/lib/oauth/providers'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${error}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=invalid_callback`
      )
    }

    // Verify state (CSRF protection)
    const cookieStore = await cookies()
    const savedState = cookieStore.get(`oauth_state_${params.provider}`)?.value
    const savedUserId = cookieStore.get(`oauth_user_${params.provider}`)?.value

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=invalid_state`
      )
    }

    // Exchange code for token
    const tokens = await exchangeCodeForToken(params.provider, code)

    // Save integration to database
    const supabase = await createClient()
    
    await supabase.from('integrations').upsert({
      user_id: savedUserId,
      platform: params.provider,
      credentials: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        tokenType: tokens.token_type,
      },
      status: 'connected',
      last_sync: new Date().toISOString(),
    })

    // Clear cookies
    cookieStore.delete(`oauth_state_${params.provider}`)
    cookieStore.delete(`oauth_user_${params.provider}`)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=${params.provider}`
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=callback_failed`
    )
  }
}

