import type { OAuthConfig } from '@/types/mcp'

export const OAUTH_PROVIDERS: Record<string, OAuthConfig> = {
  google: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/google`,
    scopes: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  notion: {
    clientId: process.env.NOTION_OAUTH_CLIENT_ID || '',
    clientSecret: process.env.NOTION_OAUTH_CLIENT_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/notion`,
    scopes: [],
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
  },
  github: {
    clientId: process.env.GITHUB_OAUTH_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/github`,
    scopes: ['repo', 'user', 'workflow'],
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
  },
}

export function getAuthorizationUrl(
  provider: string,
  state: string
): string {
  const config = OAUTH_PROVIDERS[provider]
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state,
    ...(config.scopes.length > 0 && { scope: config.scopes.join(' ') }),
  })

  // Provider-specific parameters
  if (provider === 'google') {
    params.append('access_type', 'offline')
    params.append('prompt', 'consent')
  }

  return `${config.authUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(
  provider: string,
  code: string
): Promise<any> {
  const config = OAUTH_PROVIDERS[provider]
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`)
  }

  return await response.json()
}

