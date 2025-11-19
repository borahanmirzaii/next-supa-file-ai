import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function IntegrationsLoading() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['Google', 'Notion', 'Jira', 'Slack', 'GitHub'].map((platform) => (
          <Card key={platform} className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    </div>
  )
}
