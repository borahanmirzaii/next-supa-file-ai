'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

const platforms = [
  { id: 'notion', name: 'Notion', fields: [{ name: 'apiKey', label: 'API Key', type: 'text' }] },
  { id: 'jira', name: 'Jira', fields: [
    { name: 'apiToken', label: 'API Token', type: 'text' },
    { name: 'domain', label: 'Domain', type: 'text' },
  ]},
  { id: 'google', name: 'Google', fields: [{ name: 'accessToken', label: 'Access Token', type: 'text' }] },
]

export function PlatformConnector() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const supabase = createClient()

  async function handleConnect(platformId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        platform: platformId,
        credentials,
        status: 'connected',
      })

    if (error) {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Connected',
        description: `${platformId} has been connected`,
      })
      setSelectedPlatform(null)
      setCredentials({})
    }
  }

  return (
    <div className="space-y-4">
      {platforms.map((platform) => (
        <Card key={platform.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{platform.name}</h3>
              <p className="text-sm text-muted-foreground">
                Connect your {platform.name} account
              </p>
            </div>
            <Button
              onClick={() => setSelectedPlatform(
                selectedPlatform === platform.id ? null : platform.id
              )}
            >
              {selectedPlatform === platform.id ? 'Cancel' : 'Connect'}
            </Button>
          </div>

          {selectedPlatform === platform.id && (
            <div className="mt-4 space-y-4">
              {platform.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    value={credentials[field.name] || ''}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      [field.name]: e.target.value,
                    })}
                  />
                </div>
              ))}
              <Button onClick={() => handleConnect(platform.id)}>
                Save Connection
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

