import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    </div>
  )
}
